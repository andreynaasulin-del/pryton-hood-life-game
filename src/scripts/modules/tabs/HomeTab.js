import { gameState } from '../game-state.js';
import actionSystem from '../action-system.js';
import questSystem from '../quest-system.js';

// Home Sub-modules
import { PhoneModule } from '../home/PhoneModule.js';
import { UpgradesModule } from '../home/UpgradesModule.js';
import { SocialModule } from '../home/SocialModule.js';
import { EventsModule } from '../home/EventsModule.js';
import { ActionsModule } from '../home/ActionsModule.js';
import { HomeUIRenderer } from '../home/HomeUIRenderer.js';

import { smsSystem } from '../sms-system.js';

export class HomeTab {
    constructor(uiManager) {
        this.ui = uiManager;
        window.homeTab = this;

        // Initialize sub-modules
        this.phone = new PhoneModule();
        this.upgrades = new UpgradesModule();
        this.social = new SocialModule();
        this.events = new EventsModule();
        this.actions = new ActionsModule();

        this.eventCheckInterval = null;

        // DOM Cache
        this._container = null;

        this.initSmsListeners();
    }

    /**
     * Get cached container reference
     * @private
     */
    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="home"]');
        }
        return this._container;
    }

    init() {
        this.render();
        this.startEventChecker();
    }

    destroy() {
        this.stopEventChecker();
        this._container = null;
    }

    getObjectiveText(obj) {
        if (obj.text) return obj.text;
        const map = {
            'action_completed': `Выполнить: ${obj.actionId || 'действие'}`,
            'items_bought': 'Купить предметы',
            'stat_reached': 'Достичь показателя',
            'kpi_reached': 'Заработать'
        };
        const special = { hustle: 'Суета на районе', buy: 'Купить у барыги', studio: 'Запись на студии' };
        return special[obj.id] || map[obj.type] || 'Цель';
    }

    render() {
        if (!this.container) return;

        const state = gameState.getState();
        this.container.innerHTML = HomeUIRenderer.renderMain(state, this);

        this.bindEvents(this.container);
        if (window.lucide) window.lucide.createIcons();
    }

    bindEvents(container) {
        // Hero Actions
        const sleepBtn = container.querySelector('#homeSleepBtn');
        if (sleepBtn) sleepBtn.onclick = () => this.handleSleep();

        const snackBtn = container.querySelector('#homeSnackBtn');
        if (snackBtn) snackBtn.onclick = () => this.handleSnack();

        const cleanBtn = container.querySelector('#homeCleanBtn');
        if (cleanBtn) cleanBtn.onclick = () => this.handleClean();

        // Quest Clicks
        container.querySelectorAll('.q-entry').forEach(el => {
            el.onclick = () => {
                const q = gameState.getState().quests?.active.find(aq => aq.id === el.dataset.questId);
                if (q) questSystem.showQuestModal(q);
            };
        });

        // App/Contact Clicks
        container.querySelectorAll('.app-btn').forEach(el => {
            el.onclick = () => this.handleContactClick(el.dataset.contact, el.dataset.name);
        });

        // Upgrade Purchases
        container.querySelectorAll('.buy-up-btn').forEach(btn => {
            btn.onclick = () => this.handlePurchase(btn.dataset.upgradeId);
        });
    }

    // --- HANDLERS ---
    handleSleep() {
        this.actions.sleep();
        this.ui.showToast(`Энергия восстановлена!`, 'success');
        this.render();
    }
    handleSnack() {
        if (gameState.canAfford(200)) {
            this.actions.snack();
            this.ui.showToast('Перекусил.', 'success');
            this.render();
        } else this.ui.showToast('Мало денег.', 'error');
    }
    handleClean() {
        const h = gameState.getState().home || { cleanliness: 50 };
        gameState.updateState({ home: { ...h, cleanliness: Math.min(100, (h.cleanliness || 50) + 20) } });
        gameState.advanceTime(30);
        this.ui.showToast('Убрался.', 'success');
        this.render();
    }
    handlePurchase(id) {
        if (this.upgrades.purchase(id)) {
            this.ui.showToast('Куплено!', 'success');
            this.render();
        } else this.ui.showToast('Не по карману.', 'error');
    }

    handleContactClick(id, name) {
        // Open the global phone overlay
        const overlay = document.getElementById('chatOverlay');
        const sidebar = document.getElementById('chatSidebar');
        const main = document.getElementById('chatMain');

        if (overlay && sidebar && main) {
            this.ui.showPhone(id);

            import('../SmartphoneSystem.js').then(({ smartphoneSystem }) => {
                smartphoneSystem.activeContactId = id;
                smartphoneSystem.currentView = (id === 'darkgram') ? 'darkgram' : 'chat';

                // Render Messenger Sidebar (Contacts)
                this.renderPhoneSidebar(sidebar);
                // Render Main View
                smartphoneSystem.render(main);

                const closeBtn = document.getElementById('closeChatBtn');
                if (closeBtn) closeBtn.onclick = () => this.ui.hidePhone();
            });
        }
    }

    renderPhoneSidebar(container) {
        const state = gameState.getState();
        const hour = state.time?.hour || 12;
        const contacts = this.phone.getAvailableContacts(hour);

        container.innerHTML = `
            <div class="phone-app-sidebar">
                <div class="app-sidebar-icon" onclick="window.homeTab.openPhoneHome()">
                    <i data-lucide="home"></i>
                </div>
                <div class="sidebar-divider"></div>
                ${contacts.map(c => `
                    <div class="contact-pill ${smsSystem.hasUnreadForContact(c.id) ? 'unread' : ''}" 
                         onclick="window.homeTab.handleContactClick('${c.id}', '${c.name}')" 
                         style="--c: ${c.color}">
                        <i data-lucide="${c.icon}"></i>
                    </div>
                `).join('')}
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }

    openPhoneHome() {
        import('../SmartphoneSystem.js').then(({ smartphoneSystem }) => {
            const main = document.getElementById('chatMain');
            smartphoneSystem.currentView = 'home';
            smartphoneSystem.render(main);
        });
    }

    // --- SMS EVENT HANDLERS ---
    initSmsListeners() {
        window.addEventListener('sms_received', (e) => {
            const { contactId, message } = e.detail;
            // Update home badges
            this.render();
            // Update phone if open
            import('../SmartphoneSystem.js').then(({ smartphoneSystem }) => {
                smartphoneSystem.onMessageReceived(contactId);
            });
        });

        window.addEventListener('story_choices_available', (e) => {
            const { npc, choices } = e.detail;
            // Re-render chat to show choices
            import('../SmartphoneSystem.js').then(({ smartphoneSystem }) => {
                const main = document.getElementById('chatMain');
                if (smartphoneSystem.currentView === 'chat' && smartphoneSystem.activeContactId === npc) {
                    smartphoneSystem.render(main);
                }
            });
        });
    }

    // --- EVENTS ---
    startEventChecker() {
        if (this.eventCheckInterval) return;
        this.eventCheckInterval = setInterval(() => {
            const e = this.events.triggerCheck();
            if (e) this.showHomeEvent(e);
        }, 60000);
    }
    stopEventChecker() {
        if (this.eventCheckInterval) clearInterval(this.eventCheckInterval);
        this.eventCheckInterval = null;
    }
    showHomeEvent(e) {
        const html = `
            <div class="h-ev">
                <div class="ev-d">${e.desc}</div>
                <div class="ev-btns">
                    ${e.actions.map((a, i) => `<button class="ev-opt-btn" data-index="${i}">${a.text}</button>`).join('')}
                </div>
            </div>
        `;
        this.ui.showModal(e.title, html, []);

        document.querySelectorAll('.ev-opt-btn').forEach(btn => {
            btn.onclick = () => this.handleEventAction(e, parseInt(btn.dataset.index));
        });
    }
    handleEventAction(e, i) {
        if (this.events.applyEventAction(e, i)) {
            this.ui.hideModal();
            this.render();
        }
    }
}

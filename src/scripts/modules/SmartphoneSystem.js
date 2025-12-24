import { smsSystem } from './sms-system.js';
import { gameState } from './game-state.js';
import { NPCS } from '../data/npcs.js';
import { STORY_BEATS } from '../data/StoryManifesto.js';

/**
 * SMARTPHONE SYSTEM v4.5
 * Orchestrates the Phone UI and Narrative Integration
 */
export class SmartphoneSystem {
    constructor() {
        this.currentView = 'home'; // home, chat, darkgram, news
        this.activeContactId = null;
    }

    render(container) {
        if (!container) return;

        switch (this.currentView) {
            case 'chat':
                this.renderChat(container);
                break;
            case 'news':
                this.renderNews(container);
                break;
            case 'home':
            default:
                this.renderHomeGrid(container);
                break;
        }

        if (window.lucide) window.lucide.createIcons();
    }

    renderHomeGrid(container) {
        const state = gameState.getState();
        const unreadTotal = smsSystem.getUnreadCount();
        const hour = state.time?.hour || 12;

        container.innerHTML = `
            <div class="smartphone-grid juice-mode">
                <div class="phone-status-bar">
                    <div class="p-status-left">
                        <span class="p-time">${hour.toString().padStart(2, '0')}:00</span>
                        <span class="p-provider">NEURO_LINK // 5G</span>
                    </div>
                    <div class="p-status-right">
                        <i data-lucide="wifi" class="status-ico"></i>
                        <i data-lucide="zap" class="status-ico cyan"></i>
                        <div class="p-battery">
                            <i data-lucide="battery" class="status-ico"></i>
                            <span class="p-charge">91%</span>
                        </div>
                    </div>
                </div>

                <div class="apps-container">
                    <div class="app-icon" data-app="messenger" style="--d: 0.1s">
                        ${unreadTotal > 0 ? `<div class="app-icon-badge glitch-badge">${unreadTotal}</div>` : ''}
                        <div class="app-box messenger-bg">
                            <div class="app-shimmer"></div>
                            <i data-lucide="message-square"></i>
                            <div class="app-glow"></div>
                        </div>
                        <span class="app-label">MESSENGER</span>
                    </div>

                    <div class="app-icon" data-app="darkgram" style="--d: 0.2s">
                        <div class="app-box darkgram-bg">
                            <div class="app-shimmer"></div>
                            <i data-lucide="hash"></i>
                            <div class="app-glow"></div>
                        </div>
                        <span class="app-label">DARKGRAM</span>
                    </div>

                    <div class="app-icon" data-app="news" style="--d: 0.3s">
                        <div class="app-box news-bg">
                            <div class="app-shimmer"></div>
                            <i data-lucide="globe"></i>
                            <div class="app-glow"></div>
                        </div>
                        <span class="app-label">CITY_NEWS</span>
                    </div>

                    <div class="app-icon" data-app="darknet" style="--d: 0.4s">
                        <div class="app-box darknet-bg">
                            <div class="app-shimmer"></div>
                            <i data-lucide="skull"></i>
                            <div class="app-glow"></div>
                        </div>
                        <span class="app-label">DARKNET</span>
                    </div>
                </div>

                <div class="phone-home-footer">
                    <div class="home-bar"></div>
                    <div class="footer-system-text">STP_V6.1_NEURO_LINK</div>
                </div>
            </div>
        `;

        this.bindHomeEvents(container);
    }

    bindHomeEvents(container) {
        container.querySelectorAll('.app-icon').forEach(app => {
            app.onclick = () => {
                const appName = app.dataset.app;
                if (appName === 'messenger') {
                    this.currentView = 'chat';
                    this.activeContactId = Object.keys(smsSystem.conversations)[0] || 'producer';
                    this.render(container);
                } else if (appName === 'news') {
                    this.currentView = 'news';
                    this.render(container);
                }
                // Other apps logic here
            };
        });
    }

    renderChat(container) {
        const conversations = smsSystem.getMessages(this.activeContactId);
        const npc = NPCS[this.activeContactId] || { name: 'UNKNOWN', color: '#666' };

        container.innerHTML = `
            <div class="smartphone-chat ds-scanlines">
                <div class="chat-header">
                    <button class="ph-back-btn"><i data-lucide="chevron-left"></i></button>
                    <div class="chat-info">
                        <div class="chat-name">${npc.name.toUpperCase()}</div>
                        <div class="chat-status">ONLINE</div>
                    </div>
                </div>

                <div class="chat-history" id="phoneChatHistory">
                    ${conversations.map(m => `
                        <div class="msg-bubble ${m.fromPlayer ? 'player' : 'npc'}">
                            <div class="msg-text">${m.text}</div>
                        </div>
                    `).join('')}
                    <div id="chatBottom"></div>
                </div>

                <div class="chat-controls">
                    ${this.renderChoices(this.activeContactId)}
                    <div class="input-wrap">
                        <input type="text" id="phoneMsgInput" placeholder="ОТВЕТИТЬ..." autocomplete="off">
                        <button id="phoneSendBtn"><i data-lucide="send"></i></button>
                    </div>
                </div>
            </div>
        `;

        this.bindChatEvents(container);
        this.scrollToBottom();
    }

    renderChoices(npcId) {
        const beatId = smsSystem.activeBeats[npcId];
        if (!beatId) return '';

        const beat = STORY_BEATS[beatId];
        if (!beat || !beat.choices) return '';

        return `
            <div class="choice-container">
                ${beat.choices.map((c, i) => `
                    <button class="story-choice-btn" onclick="window.smsSystem.handleChoice('${npcId}', ${i})">
                        ${c.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    bindChatEvents(container) {
        const backBtn = container.querySelector('.ph-back-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                this.currentView = 'home';
                this.render(container);
            };
        }

        const sendBtn = container.querySelector('#phoneSendBtn');
        const input = container.querySelector('#phoneMsgInput');
        if (sendBtn && input) {
            const send = () => {
                const text = input.value.trim();
                if (text && this.activeContactId) {
                    smsSystem.sendMessage(this.activeContactId, text);
                    input.value = '';
                    this.renderChat(container);
                }
            };
            sendBtn.onclick = send;
            input.onkeypress = (e) => { if (e.key === 'Enter') send(); };
        }
    }

    scrollToBottom() {
        const history = document.getElementById('phoneChatHistory');
        if (history) history.scrollTop = history.scrollHeight;
    }

    // Call this when a message is received to update UI if open
    renderNews(container) {
        const state = gameState.getState();
        const history = state.world?.history || [];

        container.innerHTML = `
            <div class="smartphone-news ds-scanlines">
                <div class="news-header">
                    <button class="ph-back-btn"><i data-lucide="chevron-left"></i></button>
                    <div class="news-title">ГОРОДСКИЕ СВОДКИ</div>
                </div>

                <div class="news-feed">
                    ${history.length === 0 ? '<div class="news-empty">НОВОСТЕЙ НЕТ. ЖДИТЕ УТРА.</div>' : history.map(item => `
                        <div class="news-item">
                            <div class="news-meta">ДЕНЬ ${item.day} // СЕКТОР-СПБ</div>
                            <div class="news-headline">${item.title}</div>
                            <div class="news-body">${item.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const backBtn = container.querySelector('.ph-back-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                this.currentView = 'home';
                this.render(container);
            };
        }
    }

    sendNotification(app, text) {
        const phone = document.querySelector('.smartphone-frame');
        if (!phone) return;

        const notif = document.createElement('div');
        notif.className = 'phone-notification';
        notif.innerHTML = `
            <div class="notif-icon"><i data-lucide="bell"></i></div>
            <div class="notif-content">
                <div class="notif-app">${app}</div>
                <div class="notif-text">${text}</div>
            </div>
        `;
        phone.appendChild(notif);

        if (window.lucide) window.lucide.createIcons();
        if (window.navigator?.vibrate) window.navigator.vibrate(200);

        setTimeout(() => {
            notif.classList.add('out');
            setTimeout(() => notif.remove(), 500);
        }, 3000);
    }

    onMessageReceived(contactId) {
        const main = document.getElementById('chatMain');
        if (this.currentView === 'chat' && this.activeContactId === contactId) {
            this.render(main);
        }
    }
}

export const smartphoneSystem = new SmartphoneSystem();

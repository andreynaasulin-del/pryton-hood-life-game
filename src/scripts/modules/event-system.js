import { gameEvents } from '../data/events.js';

class EventSystem {
    constructor() {
        this.activeEvent = null;
        this.eventCooldown = 0;
        this.minCooldown = 60; // seconds minimum between events
        this.checkInterval = null;
        this.ui = {
            overlay: null,
            modal: null,
            title: null,
            desc: null,
            choices: null
        };
    }

    init() {
        // Create UI elements if they don't exist
        this.createEventUI();

        // Start the event loop
        this.startEventLoop();

    }

    createEventUI() {
        // Check if already exists
        if (document.getElementById('eventOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'eventOverlay';
        overlay.className = 'event-overlay';
        overlay.style.display = 'none';

        overlay.innerHTML = `
            <div class="event-modal obsession-modal">
                <div class="event-header">
                    <div class="event-icon-wrapper">
                        <i data-lucide="alert-triangle" class="event-icon"></i>
                    </div>
                    <h2 id="eventTitle">СОБЫТИЕ</h2>
                </div>
                <div class="event-body">
                    <p id="eventDesc">Описание события...</p>
                </div>
                <div class="event-choices" id="eventChoices">
                    <!-- Buttons go here -->
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Cache DOM elements
        this.ui.overlay = overlay;
        this.ui.modal = overlay.querySelector('.event-modal');
        this.ui.title = overlay.querySelector('#eventTitle');
        this.ui.desc = overlay.querySelector('#eventDesc');
        this.ui.choices = overlay.querySelector('#eventChoices');

        // Refresh icons just in case
        if (window.lucide) window.lucide.createIcons();
    }

    startEventLoop() {
        // Check for events every 10 seconds
        this.checkInterval = setInterval(() => {
            if (this.eventCooldown > 0) {
                this.eventCooldown -= 10;
                return;
            }
            this.checkForEvent();
        }, 10000);
    }

    checkForEvent() {
        // Don't trigger if an event is already active or user is in a critical state (optional)
        if (this.activeEvent) return;
        if (!window.gameState) return; // Game not loaded yet

        // Simple RNG check (e.g., 30% chance every check)
        if (Math.random() > 0.3) return;

        // Pick a random event that meets conditions
        const validEvents = gameEvents.filter(event => {
            if (!event.trigger) return false;

            // Check cash condition
            if (event.trigger.minCash && window.gameState.cash < event.trigger.minCash) return false;

            // Can add more checks (health, stats)

            return true;
        });

        if (validEvents.length > 0) {
            const randomEvent = validEvents[Math.floor(Math.random() * validEvents.length)];
            this.triggerEvent(randomEvent);
        }
    }

    triggerEvent(event) {
        this.activeEvent = event;
        this.eventCooldown = this.minCooldown; // Reset cooldown

        // Populate UI
        this.ui.title.innerText = event.title;
        this.ui.desc.innerText = event.description;
        this.ui.choices.innerHTML = ''; // Clear old buttons

        event.choices.forEach(choice => {
            // Check choice conditions (e.g. need $300)
            let isDisabled = false;
            let btnText = choice.text;

            if (choice.condition) {
                if (choice.condition.cash && window.gameState.cash < choice.condition.cash) {
                    isDisabled = true;
                    btnText += ' (Не хватает денег)';
                }
            }

            const btn = document.createElement('button');
            btn.className = 'event-choice-btn';
            if (isDisabled) btn.classList.add('disabled');
            btn.disabled = isDisabled;

            btn.innerHTML = `
                <span class="choice-title">${btnText}</span>
                ${choice.description ? `<span class="choice-desc">${choice.description}</span>` : ''}
            `;

            btn.onclick = () => this.handleChoice(choice);
            this.ui.choices.appendChild(btn);
        });

        // Update Icon based on category
        const iconEl = this.ui.modal.querySelector('.event-icon');
        iconEl.setAttribute('data-lucide', this.getIconForCategory(event.category));
        if (window.lucide) window.lucide.createIcons();

        // Show UI with animation
        this.ui.overlay.style.display = 'flex';
        this.ui.modal.classList.add('pop-in');
    }

    handleChoice(choice) {
        // Determine outcome
        let outcome = choice.success;
        let isSuccess = true;

        if (choice.risk) {
            const roll = Math.random() * 100;
            if (roll < choice.risk) {
                isSuccess = false;
                outcome = choice.failure || { text: 'Неудача...', effects: {} };
            }
        }

        // Apply effects
        this.applyEffects(outcome.effects);

        // Show outcome notification (could be a toast or replace modal content)
        // For now, let's close modal and show a toast/alert
        this.closeEvent();

        // Use existing UI manager for notification if available, else alert
        if (window.uiManager && window.uiManager.showNotification) {
            const type = isSuccess ? 'success' : 'error';
            window.uiManager.showNotification(outcome.text, type);
        } else {
            alert(outcome.text);
        }
    }

    applyEffects(effects) {
        if (!effects || !window.gameState) return;
        const s = window.gameState;

        if (effects.cash) s.cash += effects.cash;
        if (effects.health) s.stats.health = Math.min(100, Math.max(0, s.stats.health + effects.health));
        if (effects.energy) s.stats.energy = Math.min(100, Math.max(0, s.stats.energy + effects.energy));
        if (effects.mood) s.stats.mood = Math.min(100, Math.max(0, s.stats.mood + effects.mood));
        if (effects.anxiety) s.stats.anxiety = Math.max(0, s.stats.anxiety + effects.anxiety);

        // Force UI update
        if (window.uiManager && window.uiManager.updateUI) {
            window.uiManager.updateUI();
        }
    }

    closeEvent() {
        this.ui.overlay.style.display = 'none';
        this.activeEvent = null;
    }

    getIconForCategory(cat) {
        switch (cat) {
            case 'danger': return 'siren';
            case 'mystery': return 'help-circle';
            case 'info': return 'terminal';
            case 'party': return 'party-popper';
            default: return 'alert-circle';
        }
    }
}

// Export singleton
const eventSystem = new EventSystem();
export default eventSystem;

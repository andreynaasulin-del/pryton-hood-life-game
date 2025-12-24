import { gameState } from './game-state.js';
import { toastManager } from './toast-manager.js';

class SecuritySystem {
    constructor() {
        this.ui = null;
    }

    init(uiManager) {
        this.ui = uiManager;
    }

    // Moved from ui-manager.js
    handleSecurityRaidChoice(choice) {
        const modal = document.getElementById('securityRaidModal');
        if (modal) modal.style.display = 'none';

        // Simple logic for raid choice
        if (choice === 'bribe') {
            if (gameState.canAfford(5000)) {
                gameState.updateKPI('cash', -5000);
                this.showNotification('Откупился от облавы. -5000₽', 'neutral');
            } else {
                this.showNotification('Не хватило денег на взятку! Тебя повязали.', 'error');
                this.triggerArrest();
            }
        } else if (choice === 'run') {
            if (Math.random() > 0.5) {
                this.showNotification('Удалось сбежать!', 'success');
            } else {
                this.showNotification('Поймали при побеге! Избили и забрали кэш.', 'error');
                gameState.updateKPI('cash', -gameState.kpis.cash * 0.5);
                gameState.updateStats('health', -20);
                this.triggerArrest(); // Optional: send to prison
            }
        }

        if (this.ui) this.ui.renderAll();
    }

    triggerArrest() {
        // Logic to send player to prison
        // For now just a log, but ideally switch tab to prison
        gameState.addLogEntry('ВАС АРЕСТОВАЛИ!', 'bad');
        if (this.ui) {
            this.ui.switchTab('prison');
        }
    }

    checkSecurityRaid(winnings) {
        // Simple logic: if winnings are huge, chance of raid
        if (winnings > 50000) {
            if (Math.random() < 0.3) {
                this.triggerRaid();
            }
        } else if (winnings > 10000) {
            if (Math.random() < 0.1) {
                this.triggerRaid();
            }
        }
    }

    triggerRaid() {
        // Show raid modal
        if (this.ui) {
            const modal = document.getElementById('securityRaidModal');
            if (modal) {
                modal.style.display = 'flex';
                // Ensure buttons are bound (they are bound in CasinoTab)
            } else {
                this.showNotification('ОБЛАВА! Но модальное окно не найдено.', 'error');
            }
        }
    }

    showNotification(message, type) {
        if (this.ui) {
            this.ui.showNotification(message, type);
        } else {
            toastManager.show(message, type);
        }
    }
}

export const securitySystem = new SecuritySystem();

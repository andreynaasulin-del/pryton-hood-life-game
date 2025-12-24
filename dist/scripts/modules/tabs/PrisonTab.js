import { gameState } from '../game-state.js';
import { PrisonUIRenderer } from '../prison/PrisonUIRenderer.js';
import { audioSystem } from '../audio-system.js';
import { visualFXManager } from '../VisualFXManager.js';
import { neuroNarrator } from '../NeuroNarrator.js';

/**
 * PRISON TAB - V5.0 (LOCKDOWN SURVIVAL)
 */
export class PrisonTab {
    constructor(uiManager) {
        this.ui = uiManager;
        this._container = null;
        this._tickUnsubscribe = null;
        this._lastInterrogationTime = 0;

        window.prisonSystem = this; // Global binding for onclicks
    }

    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="prison"]');
        }
        return this._container;
    }

    init() {
        if (!this.container) return;

        this.container.classList.add('prison-active');
        this.render();

        // Subscribe to jail ticks for real-time UI updates
        this._tickUnsubscribe = gameState.subscribe('jail:tick', () => {
            this.updateTimerOnly();
            this.checkInterrogation();
        });
    }

    destroy() {
        if (this._tickUnsubscribe) {
            this._tickUnsubscribe();
            this._tickUnsubscribe = null;
        }
        if (this.container) {
            this.container.classList.remove('prison-active');
        }
        this._container = null;
    }

    render() {
        if (!this.container) return;
        const state = gameState.getState();
        this.container.innerHTML = PrisonUIRenderer.renderMain(state, this);
        if (window.lucide) window.lucide.createIcons();
    }

    updateTimerOnly() {
        if (!this.container) return;
        const state = gameState.getState();
        const jailTime = state.jailTime || 0;
        const timerVal = this.container.querySelector('.timer-val');
        if (timerVal) {
            const minutes = Math.floor(jailTime / 60);
            const seconds = jailTime % 60;
            timerVal.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    checkInterrogation() {
        const now = Date.now();
        if (now - this._lastInterrogationTime > 60000) { // Every 60 seconds
            const box = document.getElementById('interrogationBox');
            if (box) box.style.display = 'block';
        }
    }

    arrest(seconds) {
        gameState.updateState({
            status: 'PRISON',
            jailTime: seconds
        });
        gameState.addLogEntry('ТЕБЯ ПРИНЯЛИ. ДОБРО ПОЖАЛОВАТЬ В СИСТЕМУ.', 'danger');
        audioSystem.playError();
        visualFXManager.triggerScreenShake(500);
    }

    doAction(actionId) {
        const state = gameState.getState();

        switch (actionId) {
            case 'pushups':
                if (state.stats.energy < 20) return this.ui?.showToast('НЕТ СИЛ', 'error');
                gameState.updateStat('energy', -20);
                gameState.updateState({ jailTime: Math.max(0, state.jailTime - 60) }); // -1 min
                gameState.addLogEntry('ОТЖИМАНИЯ: Срок сокращен на минуту, тело в тонусе.', 'info');
                audioSystem.playTabSwitch();
                break;

            case 'cockroaches':
                const luck = Math.random();
                if (luck > 0.7) {
                    gameState.updateNeuro('stability', 5);
                    gameState.addLogEntry('ТАРАКАНЫ ПОСТРОИЛИСЬ В РЯД. ТЫ ЧУВСТВУЕШЬ ПОРЯДОК.', 'good');
                } else if (luck < 0.2) {
                    gameState.updateNeuro('stability', -10);
                    gameState.addLogEntry('ТАРАКАНЫ НАЧАЛИ ШЕПТАТЬ ТВОЁ ИМЯ...', 'danger');
                    audioSystem.playGlitch();
                } else {
                    gameState.addLogEntry('ТЫ ПРОСТО УБИЛ ВРЕМЯ.', 'neutral');
                }
                gameState.advanceTime(30); // Kill game time
                break;

            case 'lawyer':
                if (state.kpis.cash < 50000) return this.ui?.showToast('НУЖНО ₽50,000', 'error');
                gameState.updateKPI('cash', -50000);
                gameState.updateState({ status: 'FREE', jailTime: 0 });
                gameState.addLogEntry('АДВОКАТ СДЕЛАЛ ГРЯЗНУЮ РАБОТУ. ТЫ НА СВОБОДЕ.', 'special');
                audioSystem.playCashRegister();
                break;
        }
        this.render();
    }

    startInterrogation() {
        this._lastInterrogationTime = Date.now();
        const dialog = {
            text: "СЛЕДОВАТЕЛЬ: 'ТАК ЧЕЙ ЭТО БЫЛ КЛАД, ПАРЕНЬ? СДАШЬ ПРИТОН — ВЫЙДЕШЬ СЕЙЧАС.'",
            options: [
                { text: "Я НИКОГО НЕ ЗНАЮ (ОТКАЗАТЬСЯ)", outcome: 'burn' },
                { text: "ЭТО ВСЁ ЧУЖОЕ (ЛГАТЬ)", outcome: 'luck' },
                { text: "Я ГОТОВ СОТРУДНИЧАТЬ (КРЫСИТЬ)", outcome: 'snitch' }
            ]
        };

        const content = PrisonUIRenderer.renderInterrogation(dialog);
        this.ui?.showModal('ДОПРОС', content, []);
    }

    answerInterrogation(optionIndex) {
        const state = gameState.getState();
        this.ui?.hideModal();
        const box = document.getElementById('interrogationBox');
        if (box) box.style.display = 'none';

        if (optionIndex === 0) { // Refuse
            gameState.updateStat('health', -10);
            gameState.addLogEntry('ТЕБЯ НЕМНОГО ПОМЯЛИ ЗА МОЛЧАНИЕ. НО УВАЖЕНИЕ ПРЕЖДЕ ВСЕГО.', 'danger');
        } else if (optionIndex === 1) { // Lie
            const luckText = Math.random() > 0.5 ? 'ТЕБЕ ПОВЕРИЛИ. СРОК СНИЖЕН.' : 'ТЕБЕ НЕ ПОВЕРИЛИ. СРОК УВЕЛИЧЕН.';
            const delta = Math.random() > 0.5 ? -300 : 300;
            gameState.updateState({ jailTime: Math.max(60, state.jailTime + delta) });
            gameState.addLogEntry(luckText, 'info');
        } else { // Snitch
            gameState.updateKPI('respect', -50);
            gameState.updateState({ status: 'FREE', jailTime: 0 });
            gameState.addLogEntry('ТЫ ВЫШЕЛ... НО НА РАЙОНЕ ТЕБЕ ТЕПЕРЬ НЕ РАДЫ.', 'danger');
            audioSystem.playError();
        }
        this.render();
    }

    handleGhostDeal() {
        const state = gameState.getState();
        visualFXManager.triggerFlash(0.3);
        audioSystem.playGlitch();
        neuroNarrator.showMessage("Я ВЫТАЩУ ТЕБЯ... НО ТЕПЕРЬ ТЫ ПУСТ ВНУТРИ.");

        // Payment: Lose 50% Fame and a random item if possible
        const fameLoss = Math.floor((state.music?.fame || 0) * 0.5);
        if (state.music) state.music.fame -= fameLoss;

        // Wipe some inventory
        const inv = state.inventory || [];
        if (inv.length > 0) inv.splice(Math.floor(Math.random() * inv.length), 1);

        gameState.updateState({
            status: 'FREE',
            jailTime: 0,
            inventory: inv
        });

        gameState.addLogEntry(`СДЕЛКА С ПРИЗРАКОМ: Ты на свободе, но цена была высокой. (-${fameLoss}⭐)`, 'special');
        this.render();
    }
}

export default PrisonTab;

import { gameState } from '../game-state.js';
import { DoctorUIRenderer } from '../doctor/DoctorUIRenderer.js';
import { IMPLANTS } from '../../data/implants.js';
import { audioSystem } from '../audio-system.js';
import { visualFXManager } from '../VisualFXManager.js';
import { neuroNarrator } from '../NeuroNarrator.js';

/**
 * DOCTOR TAB - V5.0 (CLINICAL HORROR & CYBERNETICS)
 */
export class DoctorTab {
    constructor(uiManager) {
        this.ui = uiManager;
        this.isTherapyActive = false;
        this.therapyTime = 0;
        this.therapyInterval = null;
        this._container = null;

        window.doctorTab = this;
    }

    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="doctor"]');
        }
        return this._container;
    }

    init() {
        if (this.container) {
            this.container.classList.add('doctor-active');
            this.render();
        }
    }

    destroy() {
        if (this.therapyInterval) clearInterval(this.therapyInterval);
        if (this.container) {
            this.container.classList.remove('doctor-active');
        }
        this._container = null;
    }

    render() {
        if (!this.container) return;
        const state = gameState.getState();
        this.container.innerHTML = DoctorUIRenderer.renderMain(state, this, IMPLANTS);
        if (window.lucide) window.lucide.createIcons();
    }

    handleDetox() {
        const cost = 5000;
        if (!gameState.canAfford(cost)) return this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');

        gameState.updateKPI('cash', -cost);
        gameState.updateStat('health', 100);

        audioSystem.playCashRegister();
        gameState.addLogEntry('ДЕТОКС ЗАВЕРШЕН: Тело очищено от токсинов.', 'good');
        this.render();
    }

    handleTherapy() {
        const cost = 8000;
        if (this.isTherapyActive) return;
        if (!gameState.canAfford(cost)) return this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');

        gameState.updateKPI('cash', -cost);
        this.isTherapyActive = true;
        this.therapyTime = 30;
        audioSystem.playTabSwitch();

        this.render();

        this.therapyInterval = setInterval(() => {
            this.therapyTime--;
            if (this.therapyTime <= 0) {
                clearInterval(this.therapyInterval);
                this.isTherapyActive = false;
                gameState.updateNeuro('stability', 50);
                gameState.addLogEntry('ТЕРАПИЯ ЗАВЕРШЕНА: Голоса в голове на время умолкли.', 'good');
                neuroNarrator.showMessage("...я ещё вернусь. Ты не сможешь вечно прятаться в белых стенах.");
                this.render();
            } else {
                this.updateMonitor();
            }
        }, 1000);
    }

    updateMonitor() {
        const monitorVal = this.container.querySelector('.therapy-status .val');
        if (monitorVal) monitorVal.textContent = this.therapyTime;
    }

    handleForcedTreatment() {
        const cost = 15000;
        if (!gameState.canAfford(cost)) return this.ui.showToast('НУЖНО ₽15,000 ДЛЯ ВЫХОДА ИЗ КЛИНИКИ', 'error');

        gameState.updateKPI('cash', -cost);
        gameState.updateState({ status: 'FREE' });
        gameState.updateNeuro('stability', 25);

        audioSystem.playSuccess();
        gameState.addLogEntry('ПРИНУДИТЕЛЬНОЕ ЛЕЧЕНИЕ ЗАВЕРШЕНО. ТЫ СНОВА МОЖЕШЬ ДЫШАТЬ.', 'good');
        this.ui.switchTab('home', true);
    }

    buyImplant(implantId) {
        const imp = IMPLANTS.find(i => i.id === implantId);
        const state = gameState.getState();
        if (!imp) return;

        if (state.neuro.implants.includes(implantId)) return;
        if (!gameState.canAfford(imp.cost)) return this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');

        gameState.updateKPI('cash', -imp.cost);
        state.neuro.implants.push(implantId);

        // Apply Penalty
        const newMax = (state.neuro.maxStability || 100) - imp.stabilityPenalty;
        gameState.updateState({ neuro: { ...state.neuro, maxStability: newMax } });
        gameState.updateNeuro('stability', 0); // Trigger clamp logic

        audioSystem.playCashRegister();
        gameState.addLogEntry(`УСТАНОВЛЕН ИМПЛАНТ: ${imp.name}. Остаток человечности: ${newMax}%`, 'special');
        this.render();
    }
}

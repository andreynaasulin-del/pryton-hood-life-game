import { gameState } from '../game-state.js';
import { FarmUIRenderer } from '../farm/FarmUIRenderer.js';
import { FARM_DATA } from '../../data/FarmData.js';
import { worldEngine } from '../WorldEngine.js';
import { audioSystem } from '../audio-system.js';

/**
 * FARM TAB - V5.1 (BIO-INDUSTRIAL)
 */
export class FarmTab {
    constructor(uiManager) {
        this.ui = uiManager;
        this._container = null;
        this._unsubscribe = null;

        window.farmTab = this;
    }

    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="farm"]');
        }
        return this._container;
    }

    init() {
        if (!this.container) return;

        this.container.classList.add('farm-active');
        this.render();

        // 🕒 OFFLINE MANAGER
        const offlineResult = gameState.calculateOfflineEarnings();
        if (offlineResult && offlineResult.mined > 0) {
            const content = FarmUIRenderer.renderOfflineModal(offlineResult);
            this.ui.showModal('ОТЧЕТ ПОСЛЕ ОТСУТСТВИЯ', content, []);
        }

        // Live updates
        this._unsubscribe = gameState.subscribe('farm:tick', () => {
            this.renderPartial();
        });
    }

    destroy() {
        if (this._unsubscribe) this._unsubscribe();
        if (this.container) {
            this.container.classList.remove('farm-active');
        }
        this._container = null;
    }

    render() {
        if (!this.container) return;
        const state = gameState.getState();
        this.container.innerHTML = FarmUIRenderer.renderMain(state, FARM_DATA);
        if (window.lucide) window.lucide.createIcons();
    }

    renderPartial() {
        if (this.ui.currentTab !== 'farm' || !this.container) return;

        const f = gameState.getState().farm;
        const gh = f.greenhouse;

        if (gh.activeView === 'mining') {
            const tempVal = this.container.querySelector('.h-stat span');
            const coinsVal = this.container.querySelector('.gold-text');
            if (tempVal) tempVal.textContent = `${f.temp.toFixed(1)}°C`;
            if (coinsVal) coinsVal.innerHTML = `<i data-lucide="database"></i> ${f.coins.toFixed(4)} ₿`;
        } else {
            // Greenhouse partial update
            const waterFill = this.container.querySelector('.gh-progress-fill.water');
            const lightFill = this.container.querySelector('.gh-progress-fill.light');
            const smellVal = this.container.querySelector('.h-stat span');

            if (waterFill) waterFill.style.width = `${gh.waterLevel}%`;
            if (lightFill) lightFill.style.width = `${gh.lightLevel}%`;
            if (smellVal) smellVal.textContent = `${Math.floor(gh.smellLevel)}%`;

            // Update slots
            gh.slots.forEach((slot, i) => {
                const slotEl = this.container.querySelectorAll('.gh-slot')[i];
                if (slotEl && slot.seedId) {
                    const prog = slotEl.querySelector('.p-progress');
                    const healthBar = slotEl.querySelector('.gh-health-bar .fill');
                    if (prog) prog.textContent = `РОСТ: ${Math.floor(slot.progress)}%`;
                    if (healthBar) healthBar.style.width = `${slot.health}%`;
                }
            });
        }
    }

    switchView(view) {
        const state = gameState.getState();
        state.farm.greenhouse.activeView = view;
        audioSystem.playTabSwitch();
        this.render();
    }

    // --- MINING ACTIONS ---
    buyGPU(id) {
        const gpu = FARM_DATA.gpus.find(g => g.id === id);
        const state = gameState.getState();
        if (!gpu || state.farm.gpus.length >= 8) return;

        const currentCost = worldEngine.getPrice(gpu.cost, 'gpus');

        if (!gameState.canAfford(currentCost)) return this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');

        gameState.updateKPI('cash', -currentCost);
        state.farm.gpus.push(id);
        gameState.addLogEntry(`ТРАНЗАКЦИЯ: Установлена [${gpu.name.toUpperCase()}]`, 'good');
        audioSystem.playCashRegister();
        this.render();
    }

    buyCooler(id) {
        const cooler = FARM_DATA.coolers.find(c => c.id === id);
        const state = gameState.getState();
        if (!cooler) return;

        const currentCost = worldEngine.getPrice(cooler.cost, 'electronics');

        if (!gameState.canAfford(currentCost)) return this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');

        gameState.updateKPI('cash', -currentCost);
        state.farm.coolers.push(id);
        gameState.addLogEntry(`ТРАНЗАКЦИЯ: Установлен [${cooler.name.toUpperCase()}]`, 'good');
        audioSystem.playCashRegister();
        this.render();
    }

    exchange() {
        const state = gameState.getState();
        const f = state.farm;
        if (f.coins < 0.01) return this.ui.showToast('МИНИМУМ 0.01 ₿', 'error');
        const rubles = Math.floor(f.coins * f.cryptoRate);
        gameState.updateKPI('cash', rubles);
        f.coins = 0;
        audioSystem.playCashRegister();
        this.render();
    }

    // --- GREENHOUSE ACTIONS ---
    waterGreenhouse() {
        const state = gameState.getState();
        state.farm.greenhouse.waterLevel = 100;
        audioSystem.playTabSwitch(); // use water sound if available
        this.render();
    }

    toggleLight() {
        const state = gameState.getState();
        state.farm.greenhouse.lightLevel = 100; // Refill
        audioSystem.playTabSwitch();
        this.render();
    }

    buySeed(id) {
        const seed = FARM_DATA.seeds.find(s => s.id === id);
        const state = gameState.getState();
        if (!seed) return;

        const currentCost = worldEngine.getPrice(seed.cost, 'electronics'); // Семена как часть электроники притона

        if (!gameState.canAfford(currentCost)) return this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');

        // Check for empty slot
        const emptyIdx = state.farm.greenhouse.slots.findIndex(s => s.seedId === null);
        if (emptyIdx === -1) return this.ui.showToast('НЕТ СВОБОДНЫХ ГОРШКОВ', 'error');

        gameState.updateKPI('cash', -currentCost);
        state.farm.greenhouse.slots[emptyIdx] = { seedId: id, progress: 0, quality: 100, health: 100 };
        gameState.addLogEntry(`АГРОНОМИЯ: Посажено [${seed.name.toUpperCase()}]`, 'good');
        audioSystem.playCashRegister();
        this.render();
    }

    harvestSlot(index) {
        const state = gameState.getState();
        const slot = state.farm.greenhouse.slots[index];
        if (!slot || slot.progress < 100) return;

        const seed = FARM_DATA.seeds.find(s => s.id === slot.seedId);
        const totalPay = seed.yield * seed.pricePerGram * (slot.health / 100);

        gameState.updateKPI('cash', Math.floor(totalPay));
        gameState.addLogEntry(`УРОЖАЙ: Продано ${seed.name} на сумму ₽${Math.floor(totalPay).toLocaleString()}`, 'special');

        state.farm.greenhouse.slots[index] = { seedId: null, progress: 0, quality: 100, health: 100 };
        audioSystem.playCashRegister();
        this.render();
    }

    buyEquipment(id) {
        const eq = FARM_DATA.equipment.find(e => e.id === id);
        const state = gameState.getState();
        if (!eq || state.farm.greenhouse.carbonFilter) return;

        const currentCost = worldEngine.getPrice(eq.cost, 'electronics');

        if (!gameState.canAfford(currentCost)) return this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');

        gameState.updateKPI('cash', -currentCost);
        state.farm.greenhouse.carbonFilter = true;
        gameState.addLogEntry(`МОДЕРНИЗАЦИЯ: Установлен [${eq.name.toUpperCase()}]`, 'good');
        audioSystem.playCashRegister();
        this.render();
    }

    scrollToMarket() {
        const market = this.container.querySelector('.f-market');
        if (market) {
            market.scrollIntoView({ behavior: 'smooth' });
            this.ui.showToast('ВЫБЕРИТЕ ОБОРУДОВАНИЕ НА РЫНКЕ', 'info');
        }
    }

    buySeedModal(index) {
        this.scrollToMarket();
    }
}

export default FarmTab;

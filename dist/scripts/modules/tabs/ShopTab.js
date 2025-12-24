import { gameState } from '../game-state.js';
import { ITEMS } from '../../data/items.js';
import { ShopUIRenderer } from '../shop/ShopUIRenderer.js';
import { worldEngine } from '../WorldEngine.js';
import { audioSystem } from '../audio-system.js';
import { visualFXManager } from '../VisualFXManager.js';
import { neuroNarrator } from '../NeuroNarrator.js';

/**
 * SHOP TAB - V5.0 (NEURO-HORROR REBOOT)
 */
export class ShopTab {
    constructor(uiManager) {
        this.ui = uiManager;
        this.activeCategory = 'street';
        this.mode = 'buy'; // buy, sell

        // DOM Cache
        this._container = null;
    }

    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="shop"]');
        }
        return this._container;
    }

    init() {
        if (this.container) {
            this.container.classList.add('shadow-market-active', 'ds-scanlines');
        }
        this.render();
    }

    destroy() {
        if (this.container) {
            this.container.classList.remove('shadow-market-active', 'ds-scanlines');
        }
        this._container = null;
    }

    render() {
        if (!this.container) return;

        const state = gameState.getState();
        this.container.innerHTML = ShopUIRenderer.renderMain(state, this.activeCategory, this.mode);

        this.bindEvents();
        if (window.lucide) window.lucide.createIcons();
    }

    bindEvents() {
        const container = this.container;
        if (!container) return;

        // Category switching
        container.querySelectorAll('.cat-btn').forEach(btn => {
            btn.onclick = () => {
                this.activeCategory = btn.dataset.cat;
                audioSystem.playTabSwitch();
                this.render();
            };
        });

        // Buy/Sell mode switch
        container.querySelectorAll('.mode-switch').forEach(btn => {
            btn.onclick = () => {
                this.mode = btn.dataset.mode;
                audioSystem.playTabSwitch();
                this.render();
            };
        });

        // Buying logic
        container.querySelectorAll('.buy-btn:not(.disabled)').forEach(btn => {
            btn.onclick = () => this.buyItem(btn.dataset.id);
        });

        // Selling logic
        container.querySelectorAll('.sell-btn').forEach(btn => {
            btn.onclick = () => this.sellItem(parseInt(btn.dataset.index), parseInt(btn.dataset.price));
        });
    }

    buyItem(id) {
        const item = ITEMS.find(i => i.id === id);
        const state = gameState.getState();

        if (!item) return;

        const currentPrice = worldEngine.getPrice(item.price, item.category);

        if (state.kpis.cash < currentPrice) {
            this.ui?.showToast('НЕДОСТАТОЧНО КЭША', 'error');
            audioSystem.playError();
            return;
        }

        // Deduct price
        gameState.updateKPI('cash', -currentPrice);

        // Visual feedback based on category
        if (item.category === 'pharma' || item.category === 'black') {
            visualFXManager.triggerScreenShake(300);
            visualFXManager.triggerFlash(0.2);
            audioSystem.playGlitch();
        } else {
            audioSystem.playCashRegister();
        }

        // Apply item logic
        if (item.consumable) {
            if (item.effect) item.effect(gameState);

            // Auto-archive Lore Shards
            if (item.id.startsWith('shard_')) {
                const artifacts = state.neuro?.artifacts || [];
                gameState.updateState({
                    neuro: {
                        ...state.neuro,
                        artifacts: [...artifacts, { id: item.id, name: item.name, date: new Date().toLocaleDateString() }]
                    }
                });
                neuroNarrator.showMessage("ДАННЫЕ ИЗВЛЕЧЕНЫ. ТЫ ВИДИШЬ БОЛЬШЕ.");
            }
        } else {
            // Permanent item (Equipment/Software)
            const purchased = state.shop?.purchased || [];
            if (!purchased.includes(item.id)) {
                gameState.updateState({
                    shop: {
                        ...state.shop,
                        purchased: [...purchased, item.id]
                    }
                });
                if (item.effect) item.effect(gameState);
            }
        }

        gameState.addLogEntry(`ТРАНЗАКЦИЯ: Куплено [${item.name.toUpperCase()}]`, 'good');
        this.ui?.showToast(`КУПЛЕНО: ${item.name}`, 'success');

        if (state.neuro.stability < 30) {
            neuroNarrator.showMessage("ТЫ КОРМИШЬ СВОИ СТРАХИ.");
        }

        this.render();
    }

    sellItem(index, price) {
        const state = gameState.getState();
        const inventory = [...(state.inventory || [])];

        if (!inventory[index]) return;

        const item = inventory[index];
        inventory.splice(index, 1);

        gameState.updateKPI('cash', price);
        gameState.updateState({ inventory });

        audioSystem.playCashRegister();
        gameState.addLogEntry(`ЛИКВИДАЦИЯ: Продано [${item.name.toUpperCase()}]`, 'info');
        this.ui?.showToast(`ПРОДАНО ЗА ₽${price}`);

        this.render();
    }
}

export default ShopTab;

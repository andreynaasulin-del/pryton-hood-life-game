import { gameState } from '../game-state.js';
import { casinoProgression } from '../casino-progression.js';
import { CasinoUIRenderer } from '../casino/CasinoUIRenderer.js';

/**
 * CASINO TAB - V3.0 (LUXURY GOLD TERMINAL)
 */
export class CasinoTab {
    constructor(uiManager) {
        this.ui = uiManager;

        // DOM Cache
        this._container = null;
    }

    /**
     * Get cached container reference
     * @private
     */
    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="casino"]');
        }
        return this._container;
    }

    init() {
        this.render();
        casinoProgression.loadFromState();
    }

    destroy() {
        this._container = null;
    }

    render() {
        if (!this.container) return;

        const state = gameState.getState();
        this.container.innerHTML = CasinoUIRenderer.renderMain(state);

        this.bindEvents();
        if (window.lucide) window.lucide.createIcons();
    }

    bindEvents() {
        const container = this.container;
        if (!container) return;

        // Buy/Sell Chips
        const buyBtn = container.querySelector('#buyChipsBtn');
        const sellBtn = container.querySelector('#sellChipsBtn');
        if (buyBtn) buyBtn.onclick = () => this.showChipExchangeModal('buy');
        if (sellBtn) sellBtn.onclick = () => this.showChipExchangeModal('sell');

        // Game Card Clicks (v4 cards)
        container.querySelectorAll('.game-card-v4').forEach(card => {
            card.onclick = () => {
                const gameId = card.dataset.game;
                if (window.uiManager && typeof window.uiManager.showCasinoGame === 'function') {
                    window.uiManager.showCasinoGame(gameId);
                }
            };
        });
    }

    showChipExchangeModal(type) {
        const isBuy = type === 'buy';
        const state = gameState.getState();
        const html = CasinoUIRenderer.renderExchangeModal(type);

        this.ui.showModal(
            isBuy ? 'ПОКУПКА_АКТИВОВ' : 'ЛИКВИДАЦИЯ_АКТИВОВ',
            html,
            [{ text: isBuy ? 'ПОДТВЕРДИТЬ ПОКУПКУ' : 'ВЫВЕСТИ КЭШ', class: isBuy ? 'gold' : 'primary', onclick: () => this.executeExchange(type) }]
        );

        const input = document.getElementById('exchangeAmount');
        const preview = document.getElementById('exchangePreview');
        const giveEl = document.getElementById('exchangeGive');
        const quickBtns = document.querySelectorAll('.quick-btn');

        const updatePreview = () => {
            const val = parseInt(input.value) || 0;
            const cost = val * 10;
            const cashGain = Math.floor(val * 9.5);

            if (isBuy) {
                if (giveEl) giveEl.textContent = `₽${cost.toLocaleString()}`;
                if (preview) preview.textContent = `+${val.toLocaleString()} CHIPS`;
            } else {
                if (giveEl) giveEl.textContent = `${val.toLocaleString()} CHIPS`;
                if (preview) preview.textContent = `₽${cashGain.toLocaleString()}`;
            }
        };

        if (input) {
            input.oninput = updatePreview;
            // Trigger initial
            updatePreview();
        }

        quickBtns.forEach(btn => {
            btn.onclick = () => {
                const val = btn.dataset.val;
                let current = parseInt(input.value) || 0;

                if (val === 'max') {
                    if (isBuy) {
                        input.value = Math.floor(state.kpis.cash / 10);
                    } else {
                        input.value = state.casino?.chips || 0;
                    }
                } else {
                    input.value = current + parseInt(val);
                }
                updatePreview();
            };
        });

        if (window.lucide) window.lucide.createIcons();
    }

    executeExchange(type) {
        const amount = parseInt(document.getElementById('exchangeAmount')?.value) || 0;
        if (amount <= 0) return;

        const state = gameState.getState();
        const isBuy = type === 'buy';
        const currentChips = state.casino?.chips || 0;

        if (isBuy) {
            const cost = amount * 10;
            if (gameState.canAfford(cost)) {
                gameState.updateKPI('cash', -cost);
                gameState.updateState({
                    casino: { ...state.casino, chips: currentChips + amount }
                });
                this.ui.showToast(`АКТИВЫ ЗАЧИСЛЕНЫ: +${amount} CHIPS`, 'success');
                this.ui.hideModal();
                this.render();
            } else {
                this.ui.showToast('НЕДОСТАТОЧНО СРЕДСТВ В СЕЙФЕ', 'error');
            }
        } else {
            if (currentChips >= amount) {
                const gain = Math.floor(amount * 9.5);
                gameState.updateKPI('cash', gain);
                gameState.updateState({
                    casino: { ...state.casino, chips: currentChips - amount }
                });
                this.ui.showToast(`КЭШ ВЫВЕДЕН: ₽${gain.toLocaleString()}`, 'success');
                this.ui.hideModal();
                this.render();
            } else {
                this.ui.showToast('НЕДОСТАТОЧНО ФИШЕК ДЛЯ ОБМЕНА', 'error');
            }
        }
    }
}

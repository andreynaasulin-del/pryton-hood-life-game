import { gameState } from '../game-state.js';
import { Utils } from '../utils.js';

/**
 * STATS CONTROLLER - Синхронизация gameState с DOM
 * Отвечает за плавные полоски и цифры в хедере.
 * ОПТИМИЗИРОВАН: кеширование DOM-элементов, throttling обновлений
 */
export class StatsController {
    constructor() {
        this.elements = {};
        this.cache = {}; // Предотвращает лишние перерисовки
        this.isInitialized = false;

        // Throttled update для предотвращения частых перерисовок
        this._throttledUpdate = Utils.throttle(this._doUpdate.bind(this), 100);
    }

    init() {
        // Кешируем все DOM элементы один раз
        this.elements = {
            cash: document.getElementById('headerCash'),
            health: document.getElementById('headerHealth'),
            bars: {
                health: document.querySelector('.stat-fill.health'),
                energy: document.querySelector('.stat-fill.energy'),
                hunger: document.querySelector('.stat-fill.hunger'),
                mood: document.querySelector('.stat-fill.mood'),
                adequacy: document.querySelector('.stat-fill.adequacy')
            },
            // Кешируем label-элементы для баров
            barLabels: {
                health: null,
                energy: null,
                hunger: null,
                mood: null,
                adequacy: null
            },
            kpis: document.querySelectorAll('.kpi-value')
        };

        // Pre-cache bar labels
        Object.entries(this.elements.bars).forEach(([key, bar]) => {
            if (bar) {
                this.elements.barLabels[key] = bar.parentElement?.nextElementSibling;
            }
        });

        this.isInitialized = true;
        console.log('[StatsController] Initialized with cached DOM elements');
    }

    /**
     * Public update - использует throttling
     */
    update() {
        if (!this.isInitialized) return;
        this._throttledUpdate();
    }

    /**
     * Force update - обходит throttle (для критических обновлений)
     */
    forceUpdate() {
        if (!this.isInitialized) return;
        this._doUpdate();
    }

    /**
     * Internal update logic
     * @private
     */
    _doUpdate() {
        const state = gameState.getState();
        const stats = state.stats;
        const kpis = state.kpis;
        const header = document.querySelector('.app-header');

        // 1. Update Stat Bars & Critical States
        const barItems = document.querySelectorAll('.stat-bar-item');
        barItems.forEach(item => {
            const title = item.getAttribute('title');
            const keyMap = {
                'Здоровье': 'health',
                'Энергия': 'energy',
                'Сытость': 'hunger',
                'Настроение': 'mood'
            };
            const key = keyMap[title];
            if (!key) return;

            const val = Math.round(stats[key] || 0);
            const fill = item.querySelector('.stat-bar-fill');

            if (fill) {
                fill.style.width = `${val}%`;
            }

            // Critical Pulse Logic (< 20%)
            if (val < 20) {
                item.classList.add('critical-pulse');
            } else {
                item.classList.remove('critical-pulse');
            }

            // Header "Damaged" state sync with Health
            if (key === 'health' && header) {
                if (val < 30) header.classList.add('damaged');
                else header.classList.remove('damaged');
            }
        });

        // 2. Update Header Digital Billboard
        // Day
        const dayEl = document.querySelector('#headerDay .stat-value');
        if (dayEl) dayEl.textContent = state.time?.day || 1;

        // Time
        const timeEl = document.querySelector('#headerTime .stat-value');
        if (timeEl) {
            const h = String(state.time?.hour || 0).padStart(2, '0');
            const m = String(state.time?.minute || 0).padStart(2, '0');
            timeEl.textContent = `${h}:${m}`;
        }

        // Cash (with Pulse Animation)
        const cashEl = document.querySelector('#headerCash .stat-value');
        const cashParent = document.getElementById('headerCash');
        if (cashEl) {
            const cashVal = Math.round(kpis.cash);
            if (this.cache.headerCash !== cashVal) {
                cashEl.textContent = cashVal.toLocaleString();
                if (cashParent) {
                    cashParent.classList.add('pulse');
                    setTimeout(() => cashParent.classList.remove('pulse'), 400);
                }
                this.cache.headerCash = cashVal;
            }
        }

        // 3. Update KPI Grid (Legacy Support)
        if (this.elements.kpis && this.elements.kpis.length >= 4) {
            this._updateKPIIfChanged(0, `₽${Math.round(kpis.cash)}`);
            this._updateKPIIfChanged(1, Math.round(kpis.respect));
            this._updateKPIIfChanged(2, Math.round(kpis.releases || 0));
            this._updateKPIIfChanged(3, Math.round(kpis.subscribers || 0));
        }
    }

    /**
     * Optimized KPI update with cache
     * @private
     */
    _updateKPIIfChanged(index, value) {
        const el = this.elements.kpis[index];
        const cacheKey = `kpi_${index}`;
        const strVal = String(value);

        if (el && this.cache[cacheKey] !== strVal) {
            el.textContent = strVal;
            this.cache[cacheKey] = strVal;
        }
    }

    updateTextIfChanged(el, text) {
        if (el && el.textContent !== String(text)) {
            el.textContent = text;
        }
    }

    /**
     * Pulse animation для stat bar
     */
    pulseStat(statName) {
        const bar = this.elements.bars[statName];
        if (bar) {
            bar.classList.add('pulse');
            setTimeout(() => bar.classList.remove('pulse'), 500);
        }
    }

    /**
     * Очистка кеша (для reset состояния)
     */
    clearCache() {
        this.cache = {};
    }
}

export const statsController = new StatsController();

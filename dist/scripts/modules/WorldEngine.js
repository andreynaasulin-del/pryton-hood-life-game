/**
 * WORLD ENGINE - Двигатель глобальных событий и экономики
 * Управляет новостями, инфляцией и случайными происшествиями.
 */
import { gameState } from './game-state.js';
import { logger } from './logger.js';

export class WorldEngine {
    constructor() {
        this.events = [
            {
                id: 'electronics_raid',
                title: 'ОБЛАВА НА СКЛАДЫ',
                text: 'Полиция накрыла крупный склад электроники. Дефицит чипов на рынке.',
                multipliers: { gpus: 1.3, electronics: 1.5 },
                riskMod: 0.1 // +10% risk on streets
            },
            {
                id: 'viral_track',
                title: 'ВИРУСНЫЙ ХИТ',
                text: 'Твой новый трек или похожий вайб взорвал ТикТок. Люди валят в клубы.',
                multipliers: { club_income: 1.5, fame_gain: 1.2 },
                hypeMod: 0.5 // Hype decays slower
            },
            {
                id: 'toxin_leak',
                title: 'ВЫБРОС ТОКСИНОВ',
                text: 'В Секторе-Х произошла утечка. Цены на антирады взлетели.',
                multipliers: { pharma: 2.0 },
                healthMod: -5 // Daily health penalty
            },
            {
                id: 'crypto_bull_run',
                title: 'РАЛЛИ КРИПТОВАЛЮТ',
                text: 'PrytonCoin пробил исторический максимум. Фермы работают на износ.',
                multipliers: { crypto_rate: 1.4 }
            }
        ];
    }

    /**
     * Генерирует новое событие дня
     */
    advanceWorld() {
        const state = gameState.getState();
        if (!state.world) state.world = { activeEvents: [], history: [], multipliers: {} };

        // Сброс старых множителей
        state.world.multipliers = {
            gpus: 1.0,
            electronics: 1.0,
            club_income: 1.0,
            fame_gain: 1.0,
            pharma: 1.0,
            crypto_rate: 1.0,
            risk: 1.0
        };

        // Шанс на событие (например, 70%)
        if (Math.random() < 0.7) {
            const event = this.events[Math.floor(Math.random() * this.events.length)];
            state.world.activeEvents = [event];
            state.world.history.unshift({ day: state.day, ...event });

            // Применяем множители
            if (event.multipliers) {
                Object.keys(event.multipliers).forEach(key => {
                    state.world.multipliers[key] = event.multipliers[key];
                });
            }

            gameState.addLogEntry(`НОВОСТИ: ${event.title}`, 'special');

            // Пуш-уведомление в телефон
            if (window.smartphoneSystem) {
                window.smartphoneSystem.sendNotification('NEWS', event.title);
            }
        } else {
            state.world.activeEvents = [];
            gameState.addLogEntry('НОВОСТИ: В городе наступило затишье.', 'info');
        }

        gameState.saveOnly();
        gameState.emit('world:update', state.world);
    }

    /**
     * Расчет динамической цены
     */
    getPrice(basePrice, category) {
        const multipliers = gameState.getState().world?.multipliers || {};
        const mult = multipliers[category] || 1.0;
        return Math.floor(basePrice * mult);
    }

    /**
     * Проверка тренда (для стрелочек в UI)
     */
    getTrend(category) {
        const multipliers = gameState.getState().world?.multipliers || {};
        const mult = multipliers[category] || 1.0;
        if (mult > 1.0) return 'up';
        if (mult < 1.0) return 'down';
        return 'stable';
    }
}

export const worldEngine = new WorldEngine();

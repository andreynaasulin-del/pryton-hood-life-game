/**
 * PRISON ACTIONS MODULE
 * Business logic for actions inside the prison.
 */
import { gameState } from '../game-state.js';
import { PRISON_DATA } from './PrisonData.js';
import { logger } from '../logger.js';

export class PrisonActionsModule {
    constructor() {
        this.actions = {
            // CELL ACTIONS
            sleep: { id: 'sleep', name: 'СПАТЬ', zone: 'cell', energy: 40, time: 180, desc: 'Глубокий сон на шконке' },
            meditate: { id: 'meditate', name: 'МЕДИТАЦИЯ', zone: 'cell', energy: -10, stats: { intellect: 1 }, time: 60, desc: 'Поиск дзена в четырех стенах' },
            pushups: { id: 'pushups', name: 'ОТЖИМАНИЯ', zone: 'cell', energy: -15, stats: { strength: 1 }, time: 30 },

            // YARD ACTIONS
            workout: { id: 'workout', name: 'ТУРНИКИ', zone: 'yard', energy: -30, stats: { strength: 2 }, time: 90, allowedTime: ['leisure', 'morning'] },
            hustle_yard: { id: 'hustle_yard', name: 'СУЕТИТЬ', zone: 'yard', energy: -20, stats: { respect: 2 }, time: 60, allowedTime: ['leisure'] },

            // LIBRARY
            read_books: { id: 'read_books', name: 'ИЗУЧАТЬ КОДЕКС', zone: 'library', energy: -15, stats: { intellect: 2 }, time: 120, allowedTime: ['leisure'] },

            // WORK ZONE
            work_sew: { id: 'sew', name: 'ШИТЬ ВАТНИКИ', zone: 'work', energy: -40, cash: 100, time: 240, allowedTime: ['work'] },
            steal_wire: { id: 'steal_wire', name: 'УКРАСТЬ ПРОВОЛОКУ', zone: 'work', energy: -10, items: { wire: 1 }, suspicion: 15, time: 30, allowedTime: ['work'] },

            // CANTEEN
            eat_balanda: { id: 'eat', name: 'ЕСТЬ БАЛАНДУ', zone: 'canteen', energy: 20, time: 45, allowedTime: ['breakfast', 'lunch', 'dinner'] },
            steal_spoon: { id: 'spoon', name: 'УКРАСТЬ ЛОЖКУ', zone: 'canteen', energy: -5, items: { spoon: 1 }, suspicion: 10, time: 10, allowedTime: ['breakfast', 'lunch', 'dinner'] }
        };
    }

    getActionById(id) {
        return this.actions[id] || Object.values(this.actions).find(a => a.id === id);
    }

    getActionsForZone(zoneId, scheduleType, currentRank) {
        return Object.values(this.actions).filter(a => a.zone === zoneId).map(action => {
            const isWrongTime = action.allowedTime && !action.allowedTime.includes(scheduleType);
            const isLowRank = action.rankReq && !this.checkRank(currentRank || 'muzhik', action.rankReq);

            return {
                ...action,
                disabled: isWrongTime || isLowRank,
                reason: isWrongTime ? 'НЕ ПО РАСПИСАНИЮ' : (isLowRank ? 'НУЖЕН РАНГ ВЫШЕ' : null)
            };
        });
    }

    checkRank(currentRank, reqRank) {
        const rankIndex = PRISON_DATA.ranks.findIndex(r => r.id === currentRank);
        const reqIndex = PRISON_DATA.ranks.findIndex(r => r.id === reqRank);
        return rankIndex >= reqIndex;
    }

    performAction(actionId) {
        const action = this.getActionById(actionId);
        if (!action) return false;

        const state = gameState.getState();

        // Apply effects
        if (action.energy) gameState.updateStat('energy', action.energy);
        if (action.cash) gameState.updateKPI('cash', action.cash);
        if (action.stats) {
            Object.entries(action.stats).forEach(([stat, val]) => {
                gameState.updateStat(stat, val);
            });
        }

        // Items logic (if exists in gameState)
        if (action.items) {
            Object.entries(action.items).forEach(([item, amount]) => {
                // Assuming gameState has a way to add items or generic prison inventory
                if (!state.prison.inventory) state.prison.inventory = {};
                state.prison.inventory[item] = (state.prison.inventory[item] || 0) + amount;
            });
        }

        // Suspicion
        if (action.suspicion) {
            const newSusp = Math.min(100, (state.prison.suspicion || 0) + action.suspicion);
            gameState.updateState({ prison: { ...state.prison, suspicion: newSusp } });
        }

        // Advance time
        if (action.time) {
            gameState.advanceTime(action.time);
        }

        logger.info(`[Prison] Performed action: ${action.name}`);
        return true;
    }
}

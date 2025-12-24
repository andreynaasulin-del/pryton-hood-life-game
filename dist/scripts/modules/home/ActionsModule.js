/**
 * ACTIONS MODULE - Home Quick Actions
 * Логика быстрых действий в квартире (сон, еда, творчество)
 */
import { gameState } from '../game-state.js';
import { Utils } from '../utils.js';

export class ActionsModule {
    constructor() {
        this.baseEnergyGain = 40;
    }

    /**
     * Действие: Сон
     */
    sleep() {
        const state = gameState.getState();
        const homeUpgrades = state.home?.upgrades || [];

        // Бонус от кровати
        const hasBed = homeUpgrades.includes('bed');
        const energyGain = this.baseEnergyGain + (hasBed ? 20 : 0);

        gameState.updateStat('energy', energyGain);
        gameState.updateStat('health', 5);
        gameState.advanceTime(480); // 8 часов

        return { energy: energyGain, time: 480 };
    }

    /**
     * Действие: Перекус
     */
    snack() {
        if (!gameState.canAfford(200)) return null;

        gameState.updateKPI('cash', -200);
        gameState.updateStat('energy', 20);
        gameState.advanceTime(30);

        return { energy: 20, cash: -200 };
    }

    /**
     * Действие: Творчество
     */
    create() {
        const state = gameState.getState();
        if ((state.stats?.energy || 0) < 20) return null;

        const homeUpgrades = state.home?.upgrades || [];
        const hasPC = homeUpgrades.includes('pc');
        const hasMic = homeUpgrades.includes('studio');

        const creativityGain = 5 + (hasPC ? 5 : 0) + (hasMic ? 10 : 0);

        gameState.updateStat('energy', -20);
        gameState.updateStat('creativity', creativityGain);
        gameState.advanceTime(120);

        return { creativity: creativityGain, energy: -20 };
    }

    /**
     * Оплата аренды
     */
    payRent(amount) {
        if (!gameState.canAfford(amount)) return false;

        gameState.updateKPI('cash', -amount);
        const home = gameState.getState().home || {};
        gameState.updateState({
            home: {
                ...home,
                lastRentPaid: Date.now()
            }
        });

        return true;
    }
}

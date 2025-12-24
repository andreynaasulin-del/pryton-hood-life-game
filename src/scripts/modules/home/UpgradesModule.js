/**
 * UPGRADES MODULE - Home Upgrades System
 * Логика апгрейдов дома
 */

import { gameState } from '../game-state.js';

export class UpgradesModule {
    constructor() {
        this.categories = ['comfort', 'electronics', 'furniture', 'decor'];
    }

    getUpgrades() {
        return [
            {
                id: 'bed_v2',
                name: 'ОРТОПЕДИЧЕСКИЙ МАТРАС',
                icon: 'moon',
                category: 'comfort',
                tier: 'rare',
                price: 2500,
                effects: { energyRegen: 15, healthRegen: 5 },
                desc: 'Твое тело скажет спасибо. Бонус к регену здоровья.'
            },
            {
                id: 'vocal_booth',
                name: 'ВОКАЛЬНАЯ БУДКА v1',
                icon: 'mic-2',
                category: 'electronics',
                tier: 'rare',
                price: 5000,
                effects: { qualityBonus: 20, fameMultiplier: 1.1 },
                desc: 'Акустический поролон и старый Shure. Твой голос звучит чище.'
            },
            {
                id: 'fortified_door',
                name: 'БРОНИРОВАННАЯ ДВЕРЬ',
                icon: 'shield-check',
                category: 'furniture',
                tier: 'rare',
                price: 3500,
                effects: { heatReduction: 0.8, security: 30 },
                desc: 'Мусора устанут ломать. Снижает риск облавы.'
            },
            {
                id: 'mix_console',
                name: 'МИКШЕРНЫЙ ПУЛЬТ',
                icon: 'sliders',
                category: 'electronics',
                tier: 'epic',
                price: 12000,
                effects: { qualityBonus: 30, creativityBonus: 20 },
                desc: 'Аналоговое тепло. Версия для настоящих ценителей.'
            },
            {
                id: 'bio_recovery',
                name: 'УСТАНОВКА "ДЕПРЕССОР"',
                icon: 'battery-medium',
                category: 'electronics',
                tier: 'legendary',
                price: 25000,
                effects: { healthRegen: 20, adequacyRegen: 10 },
                desc: 'Медленная очистка крови. Возвращает адекватность.'
            }
        ];
    }

    getPurchasedUpgrades() {
        const state = gameState.getState();
        return state.home?.upgrades || [];
    }

    isUpgradePurchased(upgradeId) {
        return this.getPurchasedUpgrades().includes(upgradeId);
    }

    canPurchase(upgradeId) {
        if (this.isUpgradePurchased(upgradeId)) return false;

        const upgrade = this.getUpgrades().find(u => u.id === upgradeId);
        if (!upgrade) return false;

        const state = gameState.getState();
        return state.kpis.cash >= upgrade.price;
    }

    purchase(upgradeId) {
        if (!this.canPurchase(upgradeId)) return false;

        const upgrade = this.getUpgrades().find(u => u.id === upgradeId);
        const state = gameState.getState();

        const upgrades = this.getPurchasedUpgrades();
        upgrades.push(upgradeId);

        gameState.updateState({
            kpis: {
                ...state.kpis,
                cash: state.kpis.cash - upgrade.price
            },
            home: {
                ...state.home,
                upgrades
            }
        });

        return true;
    }

    getUpgradesByCategory(category) {
        if (category === 'all') return this.getUpgrades();
        return this.getUpgrades().filter(u => u.category === category);
    }

    getTotalEffects() {
        const purchased = this.getPurchasedUpgrades();
        const allUpgrades = this.getUpgrades();

        const effects = {
            energyRegen: 0,
            creativityBonus: 0,
            qualityBonus: 0,
            rentReduction: 0
        };

        purchased.forEach(id => {
            const upgrade = allUpgrades.find(u => u.id === id);
            if (upgrade && upgrade.effects) {
                Object.keys(upgrade.effects).forEach(key => {
                    effects[key] = (effects[key] || 0) + upgrade.effects[key];
                });
            }
        });

        return effects;
    }

    getTierLabel(tier) {
        const labels = {
            common: 'Обычный',
            rare: 'Редкий',
            epic: 'Эпический',
            legendary: 'Легендарный'
        };
        return labels[tier] || tier;
    }

    formatEffects(effects) {
        if (!effects) return '';

        const parts = [];
        if (effects.energyRegen) parts.push(`+${effects.energyRegen} ЭНЕРГИИ`);
        if (effects.healthRegen) parts.push(`+${effects.healthRegen} ХП/СОН`);
        if (effects.qualityBonus) parts.push(`+${effects.qualityBonus}% КАЧЕСТВА`);
        if (effects.fameMultiplier) parts.push(`x${effects.fameMultiplier} К СЛАВЕ`);
        if (effects.adequacyRegen) parts.push(`+${effects.adequacyRegen} АДЕКВАТНОСТИ`);
        if (effects.security) parts.push(`+${effects.security} ЗАЩИТЫ`);

        return parts.join(' | ');
    }
}

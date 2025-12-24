import { gameState } from '../game-state.js';

export class ActionLogic {
    static checkCondition(action) {
        const state = gameState.getState();
        const stats = state.stats;
        const kpis = state.kpis;

        if (action.conditions) {
            for (const [key, req] of Object.entries(action.conditions)) {
                if (key in stats && stats[key] < req) return { ok: false, reason: `Мало: ${key}` };
                if (key in kpis && kpis[key] < req) return { ok: false, reason: `Не хватает: ${key}` };
            }
        }
        return { ok: true };
    }

    static generateOutcomes(action) {
        const state = gameState.getState();
        const doctor = state.doctor || {};
        const stats = state.stats;

        // Base outcomes
        const outcomes = [
            { text: 'Всё прошло гладко', risk: 'low', probability: 0.6 },
            { text: 'Были небольшие проблемы', risk: 'medium', probability: 0.3 },
            { text: 'Что-то пошло не так', risk: 'high', probability: 0.1 }
        ];

        // Probabilities adjustment
        const stabilityMod = (stats.stability / 100) * 0.3;
        outcomes[0].probability += stabilityMod;
        outcomes[2].probability -= stabilityMod;

        // Normalize
        const total = outcomes.reduce((s, o) => s + o.probability, 0);
        outcomes.forEach(o => o.probability /= total);

        // Populate effects
        const result = outcomes.map(o => {
            let effects = { ...action.effects };

            if (o.risk === 'medium') {
                Object.keys(effects).forEach(k => { if (effects[k] > 0) effects[k] *= 0.7; });
            } else if (o.risk === 'high') {
                Object.keys(effects).forEach(k => { if (effects[k] > 0) effects[k] *= -0.5; });
                if (['hack_atm', 'graffiti_bombing'].includes(action.id) && Math.random() < 0.3) {
                    return { ...o, effects, arrest: true, text: 'ВАС ПОВЯЗАЛИ!' };
                }
            }

            return { ...o, effects };
        });

        // Pick one based on weight
        const rand = Math.random();
        let cumulative = 0;
        for (const o of result) {
            cumulative += o.probability;
            if (rand <= cumulative) return o;
        }
        return result[0];
    }
}

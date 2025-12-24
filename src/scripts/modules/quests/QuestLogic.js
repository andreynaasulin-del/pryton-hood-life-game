import { gameState } from '../game-state.js';
import { logger } from '../logger.js';

/**
 * QUEST LOGIC
 * Core mechanics for quest processing, objective tracking, and rewards.
 */
export class QuestLogic {
    static updateObjectiveProgress(objective, eventType, amount, eventData = {}) {
        if (objective.type !== eventType) return false;

        // If specific action is required
        if (objective.actionId && objective.actionId !== eventData.actionId) return false;

        const oldCurrent = objective.current || 0;
        objective.current = Math.min(objective.target, oldCurrent + amount);

        const gained = objective.current > oldCurrent;
        if (gained && objective.current >= objective.target) {
            objective.completed = true;
            logger.info(`[QuestLogic] Objective completed: ${objective.id}`);
        }

        return gained;
    }

    static checkQuestCompletion(quest) {
        return quest.objectives.every(obj => obj.completed);
    }

    static calculateRewards(rewards) {
        return { ...rewards };
    }

    static applyRewards(rewards) {
        if (!rewards) return;

        if (rewards.cash) gameState.updateKPI('cash', rewards.cash);
        if (rewards.fame) gameState.updateKPI('fame', rewards.fame);
        if (rewards.respect) gameState.updateKPI('respect', rewards.respect);
        if (rewards.energy) gameState.updateStat('energy', rewards.energy);
        if (rewards.stability) gameState.updateStat('stability', rewards.stability);
        if (rewards.adequacy) gameState.updateStat('adequacy', rewards.adequacy);

        if (rewards.item) {
            if (!gameState.state.inventory) gameState.state.inventory = [];
            gameState.state.inventory.push({ name: rewards.item, icon: 'package' });
        }

        if (rewards.relationship) {
            Object.entries(rewards.relationship).forEach(([npc, val]) => {
                if (!gameState.state.relations) gameState.state.relations = {};
                gameState.state.relations[npc] = (gameState.state.relations[npc] || 0) + val;
            });
        }
    }
}

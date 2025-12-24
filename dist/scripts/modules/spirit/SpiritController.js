import { gameState } from '../game-state.js';
import { tickManager } from '../core/TickManager.js';
import { SPIRIT_CONFIG } from '../../data/spirit-config.js';
import { logger } from '../logger.js';

export class SpiritController {
    constructor() {
        this.lastMessageTime = 0;
    }

    init() {
        // Subscribe to ticks for ambient messages
        tickManager.subscribe(() => this.onTick());

        // Subscribe to state changes for contextual comments and goal progress
        gameState.subscribe('change', (payload) => this.onStateChange(payload));

        // Subscribe to new days for goal generation
        gameState.subscribe('newDay', () => this.generateDailyGoal());

        logger.info('[SpiritController] Око Притона открыто');
    }

    onTick() {
        const now = Date.now();
        // Send ambient message every 5-10 minutes (simulated)
        if (now - this.lastMessageTime > 300000 && Math.random() > 0.8) {
            this.sendAmbientMessage();
            this.lastMessageTime = now;
        }
    }

    onStateChange(payload) {
        // Narrow narrative comments
        if (payload.type === 'stat' && payload.name === 'health' && payload.value < 20) {
            gameState.addLogEntry('ДУХ: "Твоя искра гаснет... Сделай что-нибудь."', 'spirit');
        }

        // track daily goal progress
        this.updateDailyGoalProgress(payload);
    }

    updateDailyGoalProgress(payload) {
        const goal = gameState.state.dailyGoal;
        if (!goal || goal.completed) return;

        let progressed = false;

        // Check by type
        if (goal.id === 'stability' && payload.name === 'stability' && payload.value >= goal.target) {
            goal.completed = true;
            progressed = true;
        } else if (goal.id === 'money' && payload.name === 'cash' && payload.type === 'kpi') {
            // Check if delta was positive (we need cumulative gain for the day, but let's simplify to 'reach value' or 'increment')
            // For simplicity, let's say we track total earned today in a hidden stat, 
            // but for now we'll just increment 'current' if any cash was added.
            // (In a real implementation we'd need the delta)
        } else if (goal.id === 'music' && payload.name === 'releases' && payload.type === 'kpi') {
            goal.current++;
            if (goal.current >= goal.target) goal.completed = true;
            progressed = true;
        }

        if (goal.completed) {
            gameState.addLogEntry(`ЦЕЛЬ ДУХА ДОСТИГНУТА: ${goal.title}`, 'success');
            gameState.updateKPI('respect', 20);
            gameState.updateKPI('cash', 500);
            // We keep the goal marked completed until next day
        }

        if (progressed && window.uiManager) window.uiManager.renderAll();
    }

    sendAmbientMessage() {
        const spirit = gameState.state.spirit || { rage: 0 };
        const pool = spirit.rage > 50 ? SPIRIT_CONFIG.phrases.high_rage : SPIRIT_CONFIG.phrases.low_rage;
        const phrase = pool[Math.floor(Math.random() * pool.length)];

        gameState.addLogEntry(phrase, 'spirit');
    }

    generateDailyGoal() {
        const goal = SPIRIT_CONFIG.daily_goals[Math.floor(Math.random() * SPIRIT_CONFIG.daily_goals.length)];
        gameState.state.dailyGoal = { ...goal, current: 0, completed: false };
        logger.info(`[Spirit] Новая цель: ${goal.title}`);
    }

    updateRage(amount) {
        const spirit = gameState.state.spirit;
        if (!spirit) return;

        spirit.rage = Math.max(0, Math.min(100, spirit.rage + amount));

        if (spirit.rage >= 100) {
            gameState.addLogEntry('ДУХ ПРИТОНА В ЯРОСТИ. РЕАЛЬНОСТЬ РУШИТСЯ.', 'danger');
        }
    }
}

import { CASINO_PROGRESSION } from '../data/constants.js';
import { gameState } from './game-state.js';
import spiritSystem from './spirit-system.js';

class CasinoProgression {
    constructor() {
        this.currentLevel = 1;
        this.currentXP = 0;
    }

    // Get current level data
    getCurrentLevelData() {
        return CASINO_PROGRESSION.LEVELS[this.currentLevel] || CASINO_PROGRESSION.LEVELS[1];
    }

    // Get level name by level number
    getLevelName(level) {
        const lvl = level || this.currentLevel;
        const data = CASINO_PROGRESSION.LEVELS[lvl];
        return data ? data.name : 'Новичок';
    }

    // Get next level data
    getNextLevelData() {
        const nextLevel = this.currentLevel + 1;
        return CASINO_PROGRESSION.LEVELS[nextLevel];
    }

    // Add XP and check for level up
    addXP(amount) {
        this.currentXP += amount;
        const currentLevelData = this.getCurrentLevelData();

        // Check if leveled up
        if (this.currentXP >= currentLevelData.xpRequired) {
            this.levelUp();
        }

        // Update UI
        this.updateReputationUI();
    }

    // Level up logic
    levelUp() {
        const nextLevelData = this.getNextLevelData();
        if (!nextLevelData) {
            // Max level reached
            return;
        }

        this.currentLevel++;
        gameState.addLogEntry(` Уровень казино повышен! Теперь вы "${nextLevelData.name}"`, 'good');

        // Update game state
        gameState.getState().casino.casinoLevel = this.currentLevel;

        // Spirit comment
        spiritSystem.maybeCommentAfterAction({ id: 'casino_level_up' }, { level: this.currentLevel }, gameState.getState());
    }

    // Check if player can access a game
    canAccessGame(gameId) {
        const levelData = this.getCurrentLevelData();
        return levelData.unlockedGames.includes(gameId);
    }

    // Get max bet for current level
    getMaxBet() {
        const levelData = this.getCurrentLevelData();
        return levelData.maxBet;
    }

    // Update reputation UI
    updateReputationUI() {
        const levelData = this.getCurrentLevelData();
        const nextLevelData = this.getNextLevelData();

        // Update level name
        const levelEl = document.getElementById('casinoLevel');
        if (levelEl) {
            levelEl.textContent = levelData.name;
        }

        // Update XP display
        const xpEl = document.getElementById('casinoXP');
        const xpRequiredEl = document.getElementById('casinoXPRequired');
        if (xpEl) xpEl.textContent = this.currentXP;
        if (xpRequiredEl) {
            xpRequiredEl.textContent = nextLevelData ? nextLevelData.xpRequired : levelData.xpRequired;
        }

        // Update progress bar
        const fillEl = document.getElementById('reputationFill');
        if (fillEl) {
            let progress = 100; // Max level
            if (nextLevelData) {
                const levelStartXP = levelData.xpRequired;
                const levelEndXP = nextLevelData.xpRequired;
                const currentInLevel = this.currentXP - levelStartXP;
                const levelRange = levelEndXP - levelStartXP;
                progress = Math.min(100, (currentInLevel / levelRange) * 100);
            }
            fillEl.style.width = `${progress}%`;
        }
    }

    // Initialize from game state
    loadFromState() {
        const casino = gameState.getState().casino;
        this.currentLevel = casino.casinoLevel || 1;
        this.currentXP = casino.casinoXP || 0;
        this.updateReputationUI();
    }

    // Save to game state
    saveToState() {
        const casino = gameState.getState().casino;
        casino.casinoLevel = this.currentLevel;
        casino.casinoXP = this.currentXP;
    }
}

export const casinoProgression = new CasinoProgression();

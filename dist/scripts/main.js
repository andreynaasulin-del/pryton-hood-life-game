import { gameState } from './modules/game-state.js';
import uiManager from './modules/ui-manager.js';
import questSystem from './modules/quest-system.js';
import spiritSystem from './modules/spirit-system.js';
import doctorSystem from './modules/doctor-system.js';
import { authManager } from './modules/auth.js';
import { tickManager } from './modules/core/TickManager.js';
import { logger } from './modules/logger.js';
import { GAME_VERSION } from './data/constants.js';
import { socialFeed } from './modules/social-feed.js';
import { smsSystem } from './modules/sms-system.js';
import { eventDelegator } from './modules/core/EventDelegator.js';
import { neuroNarrator } from './modules/NeuroNarrator.js';

class GameBootstrap {
  constructor() {
    this.version = GAME_VERSION;
  }

  async init() {
    try {
      logger.info(`[Bootstrap] Запуск ДУХ ПРИТОНА v${this.version}`);

      // 1. Initialize State (Load or set initial)
      if (!gameState.load()) {
        gameState.reset();
      }

      // 2. Initialize Event Delegation (before UI)
      eventDelegator.init();

      // 3. Initialize Systems (Before UI)
      questSystem.init();
      spiritSystem.init();
      doctorSystem.init();
      socialFeed.init();
      smsSystem.init();
      socialFeed.autoPopulateFeed();
      neuroNarrator.init();

      // 4. Initialize UI (Binds DOM elements)
      uiManager.init();

      // 4. Bind Global Handlers
      this.bindGlobalEvents();

      // 5. Start the Heartbeat
      tickManager.start();

      // 6. Check for Tutorial/Intro Beat
      const state = gameState.getState();
      if (!state.storyFlags?.intro_triggered) {
        smsSystem.triggerStoryBeat('INTRO_PRODUCER');
        gameState.updateState({ storyFlags: { ...state.storyFlags, intro_triggered: true } });
      }

      logger.info('[Bootstrap] Система стабильна. Хаос под контролем.');
    } catch (error) {
      logger.error('[Bootstrap] КРИТИЧЕСКИЙ СБОЙ ПРИ ЗАПУСКЕ:', error);
    }
  }

  bindGlobalEvents() {
    // Global error handling
    window.addEventListener('error', (e) => {
      logger.error('[Global Error]', e.error);
      gameState.addLogEntry('СБОЙ В МАТРИЦЕ...', 'danger');
    });

    // Version update
    const versionEls = document.querySelectorAll('.page-version, #pageVersion');
    versionEls.forEach(el => el.textContent = this.version);
  }
}

const bootstrap = new GameBootstrap();

// Explicit export for AuthManager
export async function initGame() {
  await bootstrap.init();
}

// Entry point: Init Auth first
document.addEventListener('DOMContentLoaded', () => {
  authManager.init();
});

// Export for console debugging
window.pryton = {
  state: gameState,
  ui: uiManager,
  quests: questSystem,
  spirit: spiritSystem,
  auth: authManager,
  reset: () => {
    localStorage.clear();
    window.location.reload();
  }
};

import { gameState } from './game-state.js';
import { SpiritController } from './spirit/SpiritController.js';
import { windowManager } from './core/WindowManager.js';

export class SpiritSystem {
  constructor() {
    this.controller = new SpiritController();
    window.spiritSystem = this;
  }

  init() {
    this.controller.init();
  }

  // Public API for other modules
  updateRage(amount) {
    this.controller.updateRage(amount);
  }

  generateDailyGoal() {
    this.controller.generateDailyGoal();
  }

  maybeCommentAfterAction(action, outcome, state) {
    // Orchestrate contextual comments
    if (Math.random() > 0.4) {
      const rage = state.spirit.rage;
      const phrase = rage > 50 ? 'ДУХ: "Твои дела порождают хаос."' : 'ДУХ: "Продолжай в том же духе."';
      gameState.addLogEntry(phrase, 'spirit');
    }
  }

  // --- End-game logic (Simplified) ---
  showFinalStats() {
    const paths = gameState.state.paths;
    const content = `
            <div class="final-stats">
                <p>Музыка: ${paths.music}</p>
                <p>Хаос: ${paths.chaos}</p>
                <p>Выживание: ${paths.survival}</p>
            </div>
        `;
    windowManager.showModal('ИТОГИ ЛЕГЕНДЫ', content, [
      { text: 'В ПАМЯТЬ', action: () => window.location.reload() }
    ]);
  }

  // Legacy support for calls from GameState or UIManager
  updateStage() { }
  tickCityEvent() { }
}

const spiritSystem = new SpiritSystem();
export default spiritSystem;

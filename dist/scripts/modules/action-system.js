import { gameState } from './game-state.js';
import { windowManager } from './core/WindowManager.js';
import { ActionRewards } from './actions/ActionRewards.js';
import { MiniGameSystem } from './actions/MiniGameSystem.js';
import { ActionLogic } from './actions/ActionLogic.js';
import { StoryNarrator } from './story/Narrator.js';
import { logger } from './logger.js';

export class ActionSystem {
  constructor() {
    this.miniGames = new MiniGameSystem({
      onComplete: (result) => this.handleMiniGameResult(result)
    });
    this.currentAction = null;
  }

  performAction(action) {
    if (!action) return;

    // 1. Check conditions
    const check = ActionLogic.checkCondition(action);
    if (!check.ok) {
      windowManager.showNotification(check.reason, 'error');
      return;
    }

    this.currentAction = action;

    // 2. Check for Mini-Game
    if (action.miniGame) {
      this.miniGames.start(action);
    } else {
      // 3. Direct outcome
      const outcome = ActionLogic.generateOutcomes(action);
      this.applyOutcome(action, outcome);
    }
  }

  handleMiniGameResult(result) {
    if (!this.currentAction) return;

    const outcome = result.success ?
      { text: 'Успех!', risk: 'low', effects: this.currentAction.effects } :
      { text: 'Провал...', risk: 'high', effects: {} };

    this.applyOutcome(this.currentAction, outcome);
    this.currentAction = null;
    windowManager.hideModal();
  }

  applyOutcome(action, outcome) {
    const state = gameState.getState();

    // 1. Arrest Check
    if (outcome.arrest) {
      gameState.triggerArrest(`Попался на деле: ${action.name || action.id}`);
      return;
    }

    // 2. Apply Stats & KPIs
    ActionRewards.applyStatEffects(outcome);

    // 3. Systems Integration
    ActionRewards.handleMusicProject(action.id, state);
    ActionRewards.updateRelations(outcome, action);
    ActionRewards.checkDailyGoals(action.id);

    // 4. Time & Neuro Decay
    gameState.advanceTime(action.time || 60);

    // Neuro-link takes a toll on stability
    if (state.neuro) {
      // High energy actions drain stability faster
      const stabilityCost = Math.floor((action.energy || 10) / 10);
      gameState.updateNeuro('stability', -stabilityCost);
    }

    // 5. Spirit Narrator
    const comment = StoryNarrator.getComment(action.id, outcome, state);
    StoryNarrator.showComment(comment);

    // 6. Log & Feedback
    gameState.addLogEntry(`Действие: ${outcome.text}`, outcome.risk === 'high' ? 'danger' : 'success');

    if (window.uiManager) window.uiManager.renderAll();
    logger.info(`[ActionSystem] Applied outcome for ${action.id}`);
  }
}

const actionSystem = new ActionSystem();
window.actionSystem = actionSystem;
export default actionSystem;

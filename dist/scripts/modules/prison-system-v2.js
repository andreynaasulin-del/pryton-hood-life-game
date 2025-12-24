import { gameState } from './game-state.js';
import { PRISON_DATA } from './prison/PrisonData.js';
import { PrisonActionsModule } from './prison/PrisonActionsModule.js';
import { PrisonNPCModule } from './prison/PrisonNPCModule.js';
import { PrisonUIRenderer } from './prison/PrisonUIRenderer.js';
import { logger } from './logger.js';

export class PrisonSystem {
  constructor() {
    this.actions = new PrisonActionsModule();
    this.npcs = new PrisonNPCModule();

    this.initialized = false;
    this.container = null;
    this.spawnerIds = { rats: null, events: null };
  }

  init(container) {
    this.container = container;
    if (!this.initialized) {
      this.startSpawners();
      this.initialized = true;
    }
    window.prisonSystem = this;
    this.render();
  }

  destroy() {
    if (this.spawnerIds.rats) clearInterval(this.spawnerIds.rats);
    if (this.spawnerIds.events) clearInterval(this.spawnerIds.events);
    this.initialized = false;
  }

  getCurrentSchedule() {
    const time = gameState.getState().time || 0;
    const minutes = time % 1440;
    return PRISON_DATA.schedule.find(s => minutes >= s.start && minutes < s.end) || PRISON_DATA.schedule[0];
  }

  render() {
    if (!this.container) {
      this.container = document.querySelector('.view[data-view="prison"]');
    }
    if (!this.container) return;

    const state = gameState.getState();
    const prison = state.prison || {};
    const schedule = this.getCurrentSchedule();
    const timeStr = this.formatCurrentTime();
    const logs = state.log || [];

    this.container.innerHTML = PrisonUIRenderer.renderMain(prison, schedule, timeStr, logs);

    this.bindEvents(this.container);
    if (window.lucide) window.lucide.createIcons();
  }

  bindEvents(container) {
    container.querySelectorAll('.prison-zone-card').forEach(el => {
      el.onclick = () => this.handleZoneClick(el.dataset.zoneId);
    });

    container.querySelectorAll('.prison-npc-trigger').forEach(el => {
      el.onclick = () => this.handleNPCClick(el.dataset.npcId);
    });
  }

  handleZoneClick(zoneId) {
    const schedule = this.getCurrentSchedule();
    const state = gameState.getState();
    const actions = this.actions.getActionsForZone(zoneId, schedule.type, state.prison.rank);
    const zone = PRISON_DATA.zones.find(z => z.id === zoneId);

    const content = PrisonUIRenderer.renderActions(actions);
    this.showModal(zone.name, content);

    // Bind modal actions (v4.0)
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.querySelectorAll('.po-action-btn:not(.mode-locked)').forEach(btn => {
        btn.onclick = () => this.performAction(btn.dataset.actionId);
      });
    }
  }

  handleNPCClick(npcId) {
    const options = this.npcs.getDialogueOptions(npcId);
    const npc = PRISON_DATA.npcs.find(n => n.id === npcId);
    const greeting = this.getNPCGreeting(npcId);

    const content = PrisonUIRenderer.renderDialogue(greeting, options);
    this.showModal(npc.name, content);

    this.bindDialogueEvents(npcId);
  }

  bindDialogueEvents(npcId) {
    const modal = document.querySelector('.modal');
    if (!modal) return;

    modal.querySelectorAll('.pc-option-btn').forEach(btn => {
      btn.onclick = () => {
        const optId = btn.dataset.optionId;
        const backId = btn.dataset.backNpc;

        if (backId) {
          this.handleNPCClick(backId);
          return;
        }

        if (optId === 'exit') {
          this.hideModal();
          return;
        }

        this.handleDialogueAction(npcId, optId);
      };
    });
  }

  performAction(actionId) {
    if (this.actions.performAction(actionId)) {
      gameState.addLogEntry(`Выполнил: ${actionId}`, 'success');
      this.hideModal();
      this.render();
    }
  }

  handleDialogueAction(npcId, actionId) {
    const result = this.npcs.handleDialogAction(npcId, actionId);
    if (result) {
      const npc = PRISON_DATA.npcs.find(n => n.id === npcId);
      const content = PrisonUIRenderer.renderDialogueResult(result, npcId);
      this.showModal(npc.name, content);
      this.bindDialogueEvents(npcId);
    }
  }

  showModal(title, content) {
    if (window.uiManager) {
      window.uiManager.showModal(title, content, []);
    }
  }

  hideModal() {
    if (window.uiManager) window.uiManager.hideModal();
  }

  formatCurrentTime() {
    const time = gameState.getState().time || 0;
    const h = Math.floor(time / 60).toString().padStart(2, '0');
    const m = (time % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  getNPCGreeting(npcId) {
    const greetings = {
      kosoy: 'Че надо, бродяга? Информация стоит денег.',
      funt: 'Сигареты есть? А если найду?',
      major: 'Нарушаем режим, заключенный?',
      shifty: 'Братуха, есть дельце на пять минут.'
    };
    return greetings[npcId] || 'Слушаю тебя.';
  }

  startSpawners() {
    this.spawnerIds.events = setInterval(() => {
      if (Math.random() > 0.8) {
        gameState.addLogEntry('Слышны крики из соседнего блока...', 'neutral');
        if (window.uiManager?.currentTab === 'prison') this.render();
      }
    }, 30000);
  }
}

const prisonSystem = new PrisonSystem();
export default prisonSystem;
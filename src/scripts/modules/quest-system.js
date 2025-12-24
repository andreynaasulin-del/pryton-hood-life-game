import { gameState } from './game-state.js';
import { QUESTS } from '../data/quests-config.js';
import { QuestLogic } from './quests/QuestLogic.js';
import { windowManager } from './core/WindowManager.js';
import { logger } from './logger.js';

export class QuestSystem {
    constructor() {
        this.activeQuests = [];
        this.completedQuests = [];
        this.availableQuests = [];

        // State link (reactive)
        if (!gameState.state.quests) {
            gameState.state.quests = { active: [], completed: [], available: [] };
        }
    }

    init() {
        this.refresh();
        this.bindEvents();
        logger.info('[QuestSystem] Система квестов синхронизирована');
    }

    bindEvents() {
        // Automatically check progress on any state change
        gameState.subscribe('change', (payload) => {
            if (payload && payload.type) {
                this.updateProgress(payload.type + '_changed', payload.value, { id: payload.name });
            }
        });

        // Check specifically for actions
        gameState.subscribe('action', (actionId) => {
            this.updateProgress('action_completed', 1, { actionId });
        });

        // Handle new days (daily quests reset)
        gameState.subscribe('newDay', () => {
            this.handleNewDay();
        });
    }

    refresh() {
        const questData = gameState.state.quests || { active: [], completed: [], available: [] };
        this.activeQuests = questData.active || [];
        this.completedQuests = questData.completed || [];
        this.refreshAvailableQuests(true); // silent init
    }

    refreshAvailableQuests(isInit = false) {
        this.availableQuests = [];

        for (const id in QUESTS) {
            const q = QUESTS[id];

            // Skip if already active or completed
            if (this.completedQuests.includes(id) && q.type !== 'daily') continue;
            if (this.activeQuests.some(active => active.id === id)) continue;

            // Dependency Check: 
            // A quest is available if it's a starting quest OR it's unlocked by a completed quest
            const isStartingQuest = id === 'story_hustle'; // The very first quest
            const isUnlocked = Object.values(QUESTS).some(other =>
                other.unlocks && other.unlocks.includes(id) && this.completedQuests.includes(other.id)
            );

            // Only accept if it's the right time
            if (q.type === 'main' && !isStartingQuest && !isUnlocked) continue;

            // Requirement checks for side quests
            if (q.unlockRequirements) {
                // Implement relationship/stat checks here if needed
            }

            this.availableQuests.push(id);

            // Auto-accept main quests
            if (q.type === 'main') {
                this.acceptQuest(id, isInit);
            }
        }

        // Update available in state
        gameState.state.quests.available = this.availableQuests;
    }

    acceptQuest(id, silent = false) {
        const q = QUESTS[id];
        if (!q || this.activeQuests.some(active => active.id === id)) return;

        const activeQuest = JSON.parse(JSON.stringify(q));
        this.activeQuests.push(activeQuest);
        gameState.state.quests.active = this.activeQuests;

        gameState.addLogEntry(`Новое задание: ${q.title}`, 'good');

        if (!silent) {
            windowManager.showNotification(`КВЕСТ: ${q.title}`, 'info');
        }

        if (q.type === 'main' && !silent) {
            // Delay modal slightly to ensure UI is ready
            setTimeout(() => this.showQuestModal(activeQuest), 500);
        }
    }

    updateProgress(type, amount, data = {}) {
        let changed = false;
        this.activeQuests.forEach(q => {
            q.objectives.forEach(obj => {
                if (QuestLogic.updateObjectiveProgress(obj, type, amount, data)) {
                    changed = true;
                }
            });

            if (QuestLogic.checkQuestCompletion(q)) {
                this.completeQuest(q.id);
            }
        });

        if (changed && window.uiManager) window.uiManager.renderAll();
    }

    completeQuest(id) {
        const index = this.activeQuests.findIndex(q => q.id === id);
        if (index === -1) return;

        const q = this.activeQuests[index];
        this.activeQuests.splice(index, 1);
        this.completedQuests.push(id);

        gameState.state.quests.active = this.activeQuests;
        gameState.state.quests.completed = this.completedQuests;

        const rewards = QuestLogic.calculateRewards(q.rewards);
        QuestLogic.applyRewards(rewards);

        gameState.addLogEntry(`Квест выполнен: ${q.title}!`, 'success');
        windowManager.showNotification(`ПОБЕДА: ${q.title}`, 'success');

        this.refreshAvailableQuests(false);
    }

    handleNewDay() {
        // Reset daily quests
        this.activeQuests = this.activeQuests.filter(q => q.type !== 'daily');
        this.refreshAvailableQuests(false);
    }

    showQuestModal(q) {
        const content = `
            <div class="quest-view-v4">
                <p class="quest-desc">${q.description}</p>
                <div class="quest-objectives-v4">
                    <div class="obj-hdr">ЗАДАЧИ:</div>
                    ${q.objectives.map(o => `
                        <div class="obj-row">
                            <i data-lucide="circle-dashed"></i>
                            <span>${o.text || this.getObjectiveFallbackText(o)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        windowManager.showModal(`ЗАДАНИЕ: ${q.title}`, content, [
            { text: 'ПРИНЯТО', action: () => windowManager.hideModal(), class: 'btn-primary' }
        ]);
        if (window.lucide) window.lucide.createIcons();
    }

    getObjectiveFallbackText(obj) {
        const map = {
            'action_completed': `Выполнить: ${obj.actionId || 'действие'}`,
            'items_bought': 'Купить предметы',
            'stat_reached': 'Достичь показателя',
            'kpi_reached': 'Заработать'
        };
        return map[obj.type] || 'Выполни цель';
    }
}

const questSystem = new QuestSystem();
window.questSystem = questSystem;
export default questSystem;

import { gameState } from '../game-state.js';
import { audioSystem } from '../audio-system.js';
import { logger } from '../logger.js';

export class ActionRewards {
    static applyStatEffects(outcome) {
        const effects = outcome.effects || {};
        const state = gameState.getState();

        Object.keys(effects).forEach((key) => {
            let value = effects[key];

            // Handle random ranges [min, max]
            if (Array.isArray(value)) {
                value = Math.floor(value[0] + Math.random() * (value[1] - value[0] + 1));
            }

            // Stat updates
            if (state.stats && key in state.stats) {
                gameState.updateStat(key, value);
            }
            // KPI updates
            else if (state.kpis && key in state.kpis) {
                gameState.updateKPI(key, value);
            }
            // Path updates
            else if (key.startsWith('path_')) {
                const pathName = key.replace('path_', '');
                gameState.updatePath(pathName, value);
            }
            // Specific system updates
            else if (key === 'growRisk') {
                gameState.updateGrow('risk', value);
            }
        });
    }

    static handleMusicProject(actionId, state) {
        if (!['write_lyrics', 'studio_session', 'stream', 'street_concert'].includes(actionId)) return;

        if (!state.musicProject) {
            state.musicProject = { active: false, name: '', stage: 'idea', progress: 0, hype: 0, quality: 0 };
        }
        const project = state.musicProject;

        if (!project.active && (actionId === 'write_lyrics' || actionId === 'studio_session')) {
            project.active = true;
            project.name = `Track #${(state.kpis?.releases || 0) + 1}`;
            project.stage = 'recording';
            project.progress = 0;
            project.quality = 10;
            gameState.addLogEntry('Начат новый проект: ' + project.name, 'good');
        }

        if (project.active) {
            if (actionId === 'write_lyrics') { project.progress += 15; project.quality += 2; }
            else if (actionId === 'studio_session') { project.progress += 30; project.quality += 5; }

            if (actionId === 'stream') project.hype += 5;
            if (actionId === 'street_concert') project.hype += 10;

            if (project.progress >= 100) {
                project.progress = 0;
                if (project.stage === 'recording') {
                    project.stage = 'mixing';
                    gameState.addLogEntry('Запись завершена. Переходим к сведению.', 'good');
                } else if (project.stage === 'mixing') {
                    project.stage = 'mastering';
                    gameState.addLogEntry('Сведение готово. Остался мастеринг.', 'good');
                } else if (project.stage === 'mastering') {
                    this.finishProject(project);
                }
            }
        }
    }

    static finishProject(project) {
        project.active = false;
        project.stage = 'idea';
        gameState.updateKPI('releases', 1);
        gameState.updateKPI('fame', 20 + Math.floor(project.quality / 2));
        gameState.updateKPI('cash', 1000 + project.hype * 50);
        gameState.updatePath('music', Math.floor(project.quality / 5));
        gameState.addLogEntry(`РЕЛИЗ! Трек "${project.name}" в сети!`, 'success');
    }

    static updateRelations(outcome, action) {
        if (!outcome || !action || !action.npc) return;
        const respectGain = outcome.risk === 'low' ? 5 : (outcome.risk === 'medium' ? 2 : -5);

        // Use global NPC system if available
        if (window.npcSystem) {
            window.npcSystem.addRelationship(action.npc, respectGain);
        }
    }

    static checkDailyGoals(actionId) {
        const state = gameState.getState();
        if (state.dailyGoal && state.dailyGoal.actionId === actionId) {
            state.dailyGoal.current++;
            if (state.dailyGoal.current >= state.dailyGoal.target) {
                gameState.addLogEntry(`Цель дня выполнена: ${state.dailyGoal.title}!`, 'success');
                gameState.updateKPI('cash', state.dailyGoal.reward || 100);
                state.dailyGoal = null;
            }
        }
    }
}

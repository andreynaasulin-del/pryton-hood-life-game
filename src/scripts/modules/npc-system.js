/**
 * NPC SYSTEM v4.1 - Modular Engine
 * Manages relationships, memory, availability, and quest progression.
 */
import { gameState } from './game-state.js';
import { NPCS } from '../data/npcs.js';

class NPCSystem {
    constructor() {
        window.npcSystem = this;
        this.npcs = NPCS;
        this.relationships = {};
        this.memory = {};
        this.activeQuests = [];
        this.completedQuests = [];
        this.init();
    }

    init() {
        this.loadFromState();
    }

    loadFromState() {
        const state = gameState.getState();
        if (!state.npcData) {
            state.npcData = {
                relationships: {},
                memory: {},
                activeQuests: [],
                completedQuests: []
            };
        }
        this.relationships = state.npcData.relationships || {};
        this.memory = state.npcData.memory || {};
        this.activeQuests = state.npcData.activeQuests || [];
        this.completedQuests = state.npcData.completedQuests || [];

        // Initialize default relationships for all defined NPCs
        Object.keys(this.npcs).forEach(id => {
            if (this.relationships[id] === undefined) {
                this.relationships[id] = this.npcs[id].initialRelationship || 0;
            }
        });
    }

    save() {
        const state = gameState.getState();
        state.npcData = {
            relationships: this.relationships,
            memory: this.memory,
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests
        };
    }

    // ========== RELATIONSHIPS ==========

    getRelationship(npcId) {
        return this.relationships[npcId] || 0;
    }

    addRelationship(npcId, amount) {
        if (this.relationships[npcId] === undefined) this.relationships[npcId] = 0;
        this.relationships[npcId] = Math.max(-100, Math.min(100, this.relationships[npcId] + amount));
        this.save();
        return this.relationships[npcId];
    }

    getRelationshipLevel(npcId) {
        const rel = this.getRelationship(npcId);
        if (rel >= 80) return { level: 'family', name: 'Семья', color: '#fbbf24' };
        if (rel >= 50) return { level: 'friend', name: 'Друг', color: '#22c55e' };
        if (rel >= 20) return { level: 'known', name: 'Знакомый', color: '#3b82f6' };
        if (rel >= 0) return { level: 'neutral', name: 'Нейтрал', color: '#64748b' };
        if (rel >= -30) return { level: 'dislike', name: 'Неприязнь', color: '#f97316' };
        return { level: 'enemy', name: 'Враг', color: '#ef4444' };
    }

    // ========== MEMORY & QUESTS ==========

    remember(npcId, key, value) {
        if (!this.memory[npcId]) this.memory[npcId] = {};
        this.memory[npcId][key] = value;
        this.save();
    }

    startQuest(npcId, questId) {
        const npc = this.npcs[npcId];
        if (!npc?.quests) return;
        const quest = npc.quests.find(q => q.id === questId);
        if (!quest || this.activeQuests.includes(questId) || this.completedQuests.includes(questId)) return;
        this.activeQuests.push(questId);
        this.save();
        return quest;
    }

    completeQuest(questId) {
        if (!this.activeQuests.includes(questId)) return;
        this.activeQuests = this.activeQuests.filter(q => q !== questId);
        this.completedQuests.push(questId);

        // Find and give reward from definition
        for (const npc of Object.values(this.npcs)) {
            const quest = npc.quests?.find(q => q.id === questId);
            if (quest) {
                this.giveReward(quest.reward, npc.id);
                break;
            }
        }
        this.save();
    }

    giveReward(reward, npcId) {
        if (!reward) return;
        if (reward.cash) gameState.updateKPI('cash', reward.cash);
        if (reward.fame) {
            const s = gameState.getState();
            if (!s.music) s.music = { fame: 0 };
            s.music.fame = (s.music.fame || 0) + reward.fame;
        }
        if (reward.relationship) this.addRelationship(npcId, reward.relationship);
        if (reward.path_music) gameState.updatePath('music', reward.path_music);
        if (reward.path_chaos) gameState.updatePath('chaos', reward.path_chaos);
        if (reward.path_survival) gameState.updatePath('survival', reward.path_survival);
        if (reward.creativity) gameState.updateStat('creativity', reward.creativity);
    }

    // ========== NPC AVAILABILITY ==========

    isAvailable(npcId) {
        const npc = this.npcs[npcId];
        if (!npc) return false;

        if (npc.triggerCondition) {
            return npc.triggerCondition(gameState.getState());
        }

        if (npc.activeHours) {
            const hour = gameState.getState().time?.hour || 12;
            const { start, end } = npc.activeHours;
            if (start < end) return hour >= start && hour < end;
            return hour >= start || hour < end;
        }

        return true;
    }

    getAvailableNPCs(location = null) {
        return Object.values(this.npcs).filter(npc => {
            if (location && npc.location && npc.location !== location) return false;
            return this.isAvailable(npc.id);
        });
    }

    getNPC(npcId) { return this.npcs[npcId]; }
}

export const npcSystem = new NPCSystem();

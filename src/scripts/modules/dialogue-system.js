import { gameState } from './game-state.js';
import { npcSystem, NPCS } from './npc-system.js';

/**
 * ============================================
 *  DIALOGUE SYSTEM v3.0 - Unified NPC Dialogues
 * ============================================
 *  Uses npc-system.js for NPC data
 *  Handles dialogue UI and flow
 */

class DialogueSystem {
    constructor() {
        window.dialogueSystem = this;
        this.activeDialogue = null;
        this.currentNPC = null;
        this.dialogueHistory = [];
    }

    // ========== START DIALOGUE ==========

    startDialogue(npcId, dialogueKey = 'intro') {
        const npc = npcSystem.getNPC(npcId);
        if (!npc) {
            console.error(`NPC not found: ${npcId}`);
            return;
        }

        // Check availability
        if (!npcSystem.isAvailable(npcId)) {
            this.showUnavailable(npc);
            return;
        }

        this.currentNPC = npc;
        this.showDialogue(npcId, dialogueKey);
    }

    showUnavailable(npc) {
        const overlay = document.getElementById('modalOverlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="npc-modal unavailable">
                <div class="npc-header" style="--npc-color: ${npc.color}">
                    <div class="npc-avatar">${npc.icon}</div>
                    <div class="npc-info">
                        <h3>${npc.name}</h3>
                        <span>${npc.role}</span>
                    </div>
                </div>
                <div class="npc-body">
                    <p class="unavailable-text">Сейчас недоступен...</p>
                    ${npc.activeHours ? `<p class="hours">Часы: ${npc.activeHours.start}:00 - ${npc.activeHours.end}:00</p>` : ''}
                </div>
                <button class="npc-close-btn" onclick="dialogueSystem.close()">Закрыть</button>
            </div>
        `;
        overlay.classList.add('active');
    }

    // ========== SHOW DIALOGUE ==========

    showDialogue(npcId, dialogueKey) {
        const npc = npcSystem.getNPC(npcId);
        if (!npc) return;

        const dialogue = npc.dialogues?.[dialogueKey];
        if (!dialogue) {
            console.error(`Dialogue not found: ${npcId}.${dialogueKey}`);
            this.close();
            return;
        }

        this.activeDialogue = { npcId, dialogueKey, dialogue };
        this.dialogueHistory.push(dialogueKey);

        // Apply dialogue effect if exists
        if (dialogue.effect) {
            this.applyEffect(dialogue.effect, npcId);
        }

        // Get relationship for conditional responses
        const relationship = npcSystem.getRelationship(npcId);
        const relLevel = npcSystem.getRelationshipLevel(npcId);

        // Filter responses by condition
        const responses = (dialogue.responses || []).filter(r => {
            if (!r.condition) return true;
            return r.condition(relationship);
        });

        // Render
        const overlay = document.getElementById('modalOverlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="npc-modal" style="--npc-color: ${npc.color}">
                <div class="npc-header">
                    <div class="npc-avatar-box">
                        <pre class="npc-ascii">${npc.avatar || npc.icon}</pre>
                    </div>
                    <div class="npc-info">
                        <h3>${npc.name}</h3>
                        <span class="npc-role">${npc.role}</span>
                        <div class="npc-relationship" style="color: ${relLevel.color}">
                            <span class="rel-level">${relLevel.name}</span>
                            <span class="rel-value">${relationship > 0 ? '+' : ''}${relationship}</span>
                        </div>
                    </div>
                    <button class="npc-close-x" onclick="dialogueSystem.close()">✕</button>
                </div>
                
                <div class="npc-body">
                    <div class="npc-text">
                        <p>"${dialogue.text}"</p>
                    </div>
                    
                    <div class="npc-responses">
                        ${responses.map((r, i) => `
                            <button class="response-btn" data-index="${i}" onclick="dialogueSystem.selectResponse(${i})">
                                ${r.text}
                                ${r.cost ? `<span class="response-cost">₽${r.cost}</span>` : ''}
                                ${r.effect?.relationship ? `<span class="response-rel ${r.effect.relationship > 0 ? 'pos' : 'neg'}">${r.effect.relationship > 0 ? '+' : ''}${r.effect.relationship}</span>` : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        overlay.classList.add('active');
    }

    // ========== SELECT RESPONSE ==========

    selectResponse(index) {
        if (!this.activeDialogue) return;

        const { npcId, dialogue } = this.activeDialogue;
        const relationship = npcSystem.getRelationship(npcId);

        const responses = (dialogue.responses || []).filter(r => {
            if (!r.condition) return true;
            return r.condition(relationship);
        });

        const response = responses[index];
        if (!response) return;

        // Apply response effect
        if (response.effect) {
            this.applyEffect(response.effect, npcId);
        }

        // Handle actions
        if (response.action) {
            this.handleAction(response.action, npcId, response);
            return;
        }

        // Navigate to next dialogue
        if (response.next) {
            if (response.next === 'close') {
                this.close();
            } else {
                this.showDialogue(npcId, response.next);
            }
            return;
        }

        // Default: close
        this.close();
    }

    // ========== APPLY EFFECTS ==========

    applyEffect(effect, npcId) {
        if (!effect) return;

        if (effect.relationship) {
            npcSystem.addRelationship(npcId, effect.relationship);
        }
        if (effect.mood) {
            gameState.updateStat('mood', effect.mood);
        }
        if (effect.stability) {
            gameState.updateStat('stability', effect.stability);
        }
        if (effect.energy) {
            gameState.updateStat('energy', effect.energy);
        }
        if (effect.health) {
            gameState.updateStat('health', effect.health);
        }
        if (effect.trip) {
            gameState.updateStat('trip', effect.trip);
        }
        if (effect.heat) {
            const state = gameState.getState();
            if (!state.heat) state.heat = 0;
            state.heat = Math.max(0, Math.min(100, state.heat + effect.heat));
        }
        if (effect.path_music) {
            gameState.updatePath('music', effect.path_music);
        }
        if (effect.path_chaos) {
            gameState.updatePath('chaos', effect.path_chaos);
        }
        if (effect.path_survival) {
            gameState.updatePath('survival', effect.path_survival);
        }
        if (effect.creativity) {
            gameState.updateStat('creativity', effect.creativity);
        }
    }

    // ========== HANDLE ACTIONS ==========

    handleAction(action, npcId, response) {
        const state = gameState.getState();
        const cash = state.kpis?.cash || 0;

        switch (action) {
            case 'open_shop':
                this.close();
                // Navigate to shop tab
                if (window.uiManager) {
                    window.uiManager.switchTab('shop');
                }
                break;

            case 'heal':
                this.close();
                if (window.uiManager) {
                    window.uiManager.switchTab('doctor');
                }
                break;

            case 'open_pharmacy':
                this.close();
                if (window.uiManager) {
                    window.uiManager.switchTab('doctor');
                }
                break;

            case 'buy_beat':
            case 'buy_studio':
            case 'buy_full':
                if (response.cost && cash >= response.cost) {
                    gameState.updateKPI('cash', -response.cost);
                    npcSystem.addRelationship(npcId, 5);
                    gameState.updatePath('music', 10);
                    this.showToast(`Куплено! -₽${response.cost}`);
                    this.close();
                } else {
                    this.showToast('Не хватает денег!');
                }
                break;

            case 'buy_info_cops':
            case 'buy_info_baryga':
                if (response.cost && cash >= response.cost) {
                    gameState.updateKPI('cash', -response.cost);
                    npcSystem.addRelationship(npcId, 3);
                    this.showToast(`Инфа получена! -₽${response.cost}`);
                    this.close();
                } else {
                    this.showToast('Не хватает денег!');
                }
                break;

            case 'delivery_job':
                // Start delivery quest
                npcSystem.startQuest(npcId, 'delivery');
                this.showToast('Задание принято: Доставка');
                this.close();
                break;

            case 'hack_mission':
                npcSystem.startQuest(npcId, 'hacker');
                this.showToast('Задание принято: Взлом');
                this.close();
                break;

            case 'lesson':
                // Preacher lesson
                if (response.effect) {
                    this.applyEffect(response.effect, npcId);
                }
                this.showToast('Урок пройден! +Креативность');
                this.close();
                break;

            case 'emergency_heal':
                gameState.updateStat('health', 50);
                gameState.updateKPI('cash', -500);
                npcSystem.addRelationship(npcId, 5);
                this.showToast('Экстренная помощь оказана');
                this.close();
                break;

            default:
                console.log(`Unknown action: ${action}`);
                this.close();
        }
    }

    // ========== UTILITIES ==========

    close() {
        this.activeDialogue = null;
        this.currentNPC = null;
        this.dialogueHistory = [];

        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            // Restore original modal structure instead of clearing
            overlay.innerHTML = `
                <div class="modal">
                    <h2 id="modalTitle"></h2>
                    <p id="modalText"></p>
                    <div class="modal-choices" id="modalChoices"></div>
                </div>
            `;
        }
    }

    showToast(message) {
        if (window.uiManager?.showToast) {
            window.uiManager.showToast(message);
        }
    }

    // ========== TRIGGER DIALOGUES ==========

    // Check for triggered dialogues (shadow, echo)
    checkTriggers() {
        const state = gameState.getState();

        // Shadow appears at low stability
        if (npcSystem.isAvailable('shadow')) {
            const dialogues = ['whisper_low', 'whisper_danger', 'whisper_tempt'];
            const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
            this.startDialogue('shadow', randomDialogue);
            return true;
        }

        // Echo appears randomly
        if (npcSystem.isAvailable('echo')) {
            const dialogues = ['memory_happy', 'memory_regret', 'memory_person'];
            const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
            this.startDialogue('echo', randomDialogue);
            return true;
        }

        return false;
    }

    // ========== RELATIONSHIP HELPERS ==========

    getRelationship(npcId) {
        return npcSystem.getRelationship(npcId);
    }

    addRelationship(npcId, amount) {
        return npcSystem.addRelationship(npcId, amount);
    }
}

export const dialogueSystem = new DialogueSystem();

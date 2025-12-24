import { STORY_BEATS } from '../data/StoryManifesto.js';
import { gameState } from './game-state.js';

/**
 * SMS MESSENGER SYSTEM v4.5
 * Interactive Story & Narrative Hub
 */
export class SmsSystem {
    constructor() {
        window.smsSystem = this;
        this.conversations = {};
        this.unreadCount = 0;
        this.activeBeats = {};
    }

    init(savedConversations) {
        if (savedConversations) {
            this.conversations = savedConversations;
            this.calculateUnread();
        } else {
            this.loadFromGameState();
        }
    }

    loadFromGameState() {
        const state = gameState.getState();
        if (state.smsConversations) {
            this.conversations = state.smsConversations;
            this.activeBeats = state.activeStoryBeats || {};
            this.calculateUnread();
        }
    }

    saveToGameState() {
        const state = gameState.getState();
        state.smsConversations = this.conversations;
        state.activeStoryBeats = this.activeBeats;
    }

    sendMessage(contactId, text, fromPlayer = true, metadata = {}) {
        if (!this.conversations[contactId]) {
            this.conversations[contactId] = [];
        }

        const message = {
            id: Date.now() + Math.random(),
            text,
            fromPlayer,
            timestamp: Date.now(),
            read: fromPlayer,
            ...metadata
        };

        this.conversations[contactId].push(message);

        if (!fromPlayer) {
            this.unreadCount++;
        }

        this.saveToGameState();

        // Dispatch event for UI updates
        const event = new CustomEvent('sms_received', { detail: { contactId, message } });
        window.dispatchEvent(event);

        return message;
    }

    receiveMessage(contactId, text, metadata = {}) {
        return this.sendMessage(contactId, text, false, metadata);
    }

    // Trigger a Story Beat (The "Spirit" of the narrative)
    async triggerStoryBeat(beatId) {
        const beat = STORY_BEATS[beatId];
        if (!beat) return;

        console.log(`[Narrative] Triggering beat: ${beatId}`);

        for (const msg of beat.messages) {
            await new Promise(res => setTimeout(res, msg.delay || 2000));
            this.receiveMessage(beat.npc, msg.text, { type: 'story', beatId: beat.id });
        }

        if (beat.choices) {
            this.activeBeats[beat.npc] = beatId;
            this.saveToGameState();
            window.dispatchEvent(new CustomEvent('story_choices_available', {
                detail: { npc: beat.npc, choices: beat.choices }
            }));
        }
    }

    handleChoice(npcId, choiceIndex) {
        const beatId = this.activeBeats[npcId];
        const beat = STORY_BEATS[beatId];
        if (!beat) return;

        const choice = beat.choices[choiceIndex];
        if (!choice) return;

        // 1. Send player's choice as a message
        this.sendMessage(npcId, choice.text, true);

        // 2. Execute choice action
        if (choice.action) choice.action(gameState.getState());

        // 3. Cleanup or Move to next beat
        delete this.activeBeats[npcId];
        this.saveToGameState();

        if (choice.next) {
            this.triggerStoryBeat(choice.next);
        }

        window.dispatchEvent(new Event('story_choices_closed'));
    }

    markAsRead(contactId) {
        const conversation = this.conversations[contactId];
        if (!conversation) return;

        conversation.forEach(msg => {
            if (!msg.read && !msg.fromPlayer) {
                msg.read = true;
                this.unreadCount--;
            }
        });

        this.unreadCount = Math.max(0, this.unreadCount);
        this.saveToGameState();
    }

    getMessages(contactId) {
        return this.conversations[contactId] || [];
    }

    calculateUnread() {
        this.unreadCount = 0;
        Object.values(this.conversations).forEach(conv => {
            conv.forEach(msg => {
                if (!msg.read && !msg.fromPlayer) {
                    this.unreadCount++;
                }
            });
        });
    }

    getUnreadCount() { return this.unreadCount; }
    hasUnread() { return this.unreadCount > 0; }

    hasUnreadForContact(contactId) {
        const conv = this.conversations[contactId];
        if (!conv) return false;
        return conv.some(msg => !msg.read && !msg.fromPlayer);
    }
}

export const smsSystem = new SmsSystem();

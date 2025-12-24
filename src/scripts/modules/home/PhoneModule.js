/**
 * PHONE MODULE - Contacts, Quests, Gifts
 * Логика телефона и контактов
 */

import { gameState } from '../game-state.js';
import questSystem from '../quest-system.js';

export class PhoneModule {
    constructor() {
        this.contacts = this.getDefaultContacts();
    }

    getDefaultContacts() {
        return [
            {
                id: 'baryga',
                name: 'Барыга',
                icon: 'pill',
                color: '#22c55e',
                activeHours: { start: 22, end: 6 },
                role: 'Дилер',
                location: 'street'
            },
            {
                id: 'zef',
                name: 'Зеф',
                icon: 'headphones',
                color: '#6366f1',
                activeHours: { start: 20, end: 4 },
                role: 'Продюсер андеграунда',
                location: 'club'
            },
            {
                id: 'bones',
                name: 'Бонс',
                icon: 'heart-pulse',
                color: '#ef4444',
                activeHours: null,
                role: 'Доктор притона',
                location: 'doctor'
            },
            {
                id: 'glitch',
                name: 'Глитч',
                icon: 'terminal',
                color: '#06b6d4',
                activeHours: null,
                role: 'Инфо-брокер',
                location: 'street'
            },
            {
                id: 'preacher',
                name: 'Проповедник',
                icon: 'mic',
                color: '#f59e0b',
                activeHours: { start: 18, end: 2 },
                role: 'Бывшая легенда',
                location: 'club'
            },
            {
                id: 'shadow',
                name: 'Тень',
                icon: 'ghost',
                color: '#1e1e2e',
                activeHours: null,
                role: 'Внутренний голос',
                location: null,
                special: true
            },
            {
                id: 'echo',
                name: 'Эхо',
                icon: 'rewind',
                color: '#a855f7',
                activeHours: null,
                role: 'Голос прошлого',
                location: null,
                special: true
            }
        ];
    }

    isContactAvailable(contactId, currentHour) {
        const contact = this.contacts.find(c => c.id === contactId);
        if (!contact || !contact.activeHours) return true;

        const { start, end } = contact.activeHours;
        return start < end
            ? (currentHour >= start && currentHour < end)
            : (currentHour >= start || currentHour < end);
    }

    getAvailableContacts(currentHour) {
        return this.contacts.filter(c => this.isContactAvailable(c.id, currentHour));
    }

    getContactsByLocation(location) {
        return this.contacts.filter(c => c.location === location);
    }

    // Quest helpers
    getActiveQuests() {
        if (!window.questSystem) return [];
        return window.questSystem.getActiveQuests() || [];
    }

    getAvailableQuests() {
        if (!window.questSystem) return [];
        return window.questSystem.getAvailableQuests() || [];
    }

    formatQuestReward(rewards) {
        if (!rewards) return '';

        const parts = [];
        if (rewards.cash) parts.push(`${rewards.cash}₽`);
        if (rewards.fame) parts.push(`${rewards.fame} славы`);
        if (rewards.respect) parts.push(`${rewards.respect} уважения`);

        return parts.join(', ');
    }

    // Gift system
    getAvailableGifts() {
        const state = gameState.getState();
        return state.inventory || [];
    }

    canSendGift(giftId, recipientId) {
        const gifts = this.getAvailableGifts();
        const gift = gifts.find(g => g.id === giftId);

        if (!gift) return false;

        const recipient = this.contacts.find(c => c.id === recipientId);
        return !!recipient;
    }

    sendGift(giftId, recipientId) {
        if (!this.canSendGift(giftId, recipientId)) return false;

        const state = gameState.getState();
        const inventory = state.inventory || [];
        const giftIndex = inventory.findIndex(i => i.id === giftId);

        if (giftIndex === -1) return false;

        // Remove gift from inventory
        inventory.splice(giftIndex, 1);

        // Update NPC relationship (if npcSystem exists)
        if (window.npcSystem) {
            window.npcSystem.modifyRelationship(recipientId, 10);
        }

        gameState.updateState({ inventory });
        return true;
    }
}

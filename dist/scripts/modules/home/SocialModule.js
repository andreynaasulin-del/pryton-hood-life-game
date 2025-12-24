/**
 * SOCIAL MODULE - DarkGram & Messenger Logic
 * Логика социальной сети и мессенджера
 */

import { gameState } from '../game-state.js';
import { socialFeed } from '../social-feed.js';
import { smsSystem } from '../sms-system.js';

export class SocialModule {
    constructor() {
        this.postsPerPage = 5;
    }

    /**
     * Получить посты социальной ленты
     */
    getFeedPosts() {
        return socialFeed.getPosts() || [];
    }

    /**
     * Создать новый пост (Legacy wrapper)
     */
    createPost(content, author = '@you', type = 'status') {
        return socialFeed.addPost(type, content, author, Date.now());
    }

    /**
     * Получить сообщения чата с конкретным NPC
     */
    getChatMessages(contactId) {
        if (!smsSystem || typeof smsSystem.getMessages !== 'function') {
            console.warn('[SocialModule] smsSystem.getMessages not available');
            return [];
        }
        return smsSystem.getMessages(contactId) || [];
    }

    /**
     * Отправить сообщение NPC
     */
    sendMessage(contactId, text) {
        if (!text || text.trim() === '') return false;
        if (!smsSystem || typeof smsSystem.sendMessage !== 'function') {
            console.error('[SocialModule] smsSystem.sendMessage not available');
            return false;
        }

        return smsSystem.sendMessage(contactId, {
            text,
            sender: 'player',
            timestamp: Date.now()
        });
    }

    /**
     * Форматирование времени "назад" (например, "5 мин. назад")
     */
    getTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);

        if (mins < 1) return 'только что';
        if (mins < 60) return `${mins} мин.`;

        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} ч.`;

        return `${Math.floor(hours / 24)} дн.`;
    }

    /**
     * Получить CSS класс для типа поста
     */
    getPostTypeClass(type) {
        const classes = {
            'status': 'post-status',
            'photo': 'post-photo',
            'ad': 'post-ad',
            'event': 'post-event'
        };
        return classes[type] || 'post-status';
    }

    /**
     * Лайкнуть пост
     */
    likePost(postId) {
        if (!socialFeed || typeof socialFeed.likePost !== 'function') return false;
        return socialFeed.likePost(postId);
    }

    /**
     * Проверка на непрочитанные сообщения
     */
    hasUnreadMessages() {
        if (!smsSystem || typeof smsSystem.hasUnread !== 'function') return false;
        return smsSystem.hasUnread();
    }

    /**
     * Проверка на непрочитанные сообщения от конкретного контакта
     */
    hasUnreadByContact(contactId) {
        if (!smsSystem || typeof smsSystem.hasUnreadForContact !== 'function') return false;
        return smsSystem.hasUnreadForContact(contactId);
    }

    /**
     * Пометить диалог как прочитанный
     */
    markAsRead(contactId) {
        if (!smsSystem || typeof smsSystem.markAsRead !== 'function') return false;
        return smsSystem.markAsRead(contactId);
    }
}

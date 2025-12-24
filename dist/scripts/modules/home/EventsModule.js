/**
 * EVENTS MODULE - Random Home Events
 * Логика случайных событий в квартире
 */

import { gameState } from '../game-state.js';
import { Utils } from '../utils.js';

export class EventsModule {
    constructor() {
        this.eventChance = 0.15; // 15% шанс при входе/обновлении
    }

    /**
     * Получить список возможных домашних событий
     */
    getPossibleEvents() {
        return [
            {
                id: 'neighbor_noise',
                title: 'Шум из-за стены',
                desc: 'Соседи опять что-то празднуют. Стены дрожат от баса.',
                actions: [
                    { text: 'Постучать по батарее', effect: { respect: 5, health: -5 } },
                    { text: 'Включить музыку громче', effect: { creativity: 10, respect: -5 } },
                    { text: 'Игнорировать', effect: { health: -10 } }
                ]
            },
            {
                id: 'police_check',
                title: 'Подозрительные шаги',
                desc: 'На лестничной клетке кто-то ходит и светит фонариком.',
                actions: [
                    { text: 'Спрятать всё', effect: { cash: -100, respect: 10 } },
                    { text: 'Посмотреть в глазок', effect: { health: -15, respect: 5 } }
                ]
            },
            {
                id: 'leak',
                title: 'Протечка',
                desc: 'С потолка в ванной начало капать. Похоже, сверху заливают.',
                actions: [
                    { text: 'Идти ругаться', effect: { respect: 10, health: -10 } },
                    { text: 'Подставить тазик', effect: { health: -5, cash: -50 } }
                ]
            }
        ];
    }

    /**
     * Проверка на случайное событие
     */
    triggerCheck() {
        if (Math.random() < this.eventChance) {
            const events = this.getPossibleEvents();
            return Utils.randomElement(events);
        }
        return null;
    }

    /**
     * Применить эффекты действия события
     */
    applyEventAction(event, actionIndex) {
        const action = event.actions[actionIndex];
        if (!action || !action.effect) return false;

        const state = gameState.getState();
        const newStats = { ...state.stats };
        const newKpis = { ...state.kpis };

        // Применяем эффекты (сори за мутабельность, для совместимости с текущим стейтом)
        Object.keys(action.effect).forEach(key => {
            if (newStats[key] !== undefined) {
                newStats[key] = Utils.clamp(newStats[key] + action.effect[key], 0, 100);
            }
            if (newKpis[key] !== undefined) {
                newKpis[key] += action.effect[key];
            }
        });

        gameState.updateState({
            stats: newStats,
            kpis: newKpis
        });

        return true;
    }
}

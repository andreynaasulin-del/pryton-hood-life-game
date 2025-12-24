/**
 * STORY NARRATOR MODULE
 * Handles "Spirit of the Den" comments and atmospheric narrative pops.
 */
import { gameState } from '../game-state.js';

export class StoryNarrator {
    static getComment(actionId, outcome, state) {
        const adequacy = state.stats?.adequacy || 100;
        const stability = state.stats?.stability || 100;
        const chaos = state.paths?.chaos || 0;

        // Psychosis comments (very high priority)
        if (adequacy < 30 && Math.random() > 0.5) {
            const psychotic = [
                "Стены начинают шевелиться... Ты это видел?",
                "Твоё отражение в луже улыбнулось тебе. Оно знает правду.",
                "Слышишь этот скрежет? Это реальность разваливается на куски.",
                "Тень за твоей спиной... она стала выше."
            ];
            return psychotic[Math.floor(Math.random() * psychotic.length)];
        }

        // Action specific comments
        if (actionId === 'street_hustle') {
            if (outcome.risk === 'high') return "Удача любит наглых, но смерть — наглых и глупых.";
            return "Копейка к копейке... Грязные деньги пахнут лучше всего.";
        }

        if (actionId === 'studio_session') {
            return "Твой звук просачивается сквозь бетон. Притон слушает.";
        }

        if (actionId === 'casino_win') {
            return "Сегодня боги азарта пьяны. Пользуйся моментом.";
        }

        // General atmospheric comments
        if (stability < 50) return "Твой дух слабеет. Притон начинает пожирать тебя изнутри.";
        if (chaos > 50) return "Хаос в твоих жилах... Ты становишься частью этого города.";

        return null;
    }

    static showComment(comment) {
        if (!comment) return;

        // Show as a special Toast or in a Narrative Log
        if (window.uiManager) {
            window.uiManager.showToast(`👁️ ${comment}`, 'narrative');
        }

        console.log(`[Narrator]: ${comment}`);
    }
}

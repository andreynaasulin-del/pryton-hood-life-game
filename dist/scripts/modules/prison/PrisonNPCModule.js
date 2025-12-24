import { gameState } from '../game-state.js';
import { PRISON_DATA } from './PrisonData.js';

export class PrisonNPCModule {
    constructor() {
        this.dialogues = {
            kosoy: {
                rumors: [
                    'Говорят, начальник тюрьмы опять в запое.',
                    'Скоро шмон будет, прячь заточку.',
                    'Вчера в столовке крысу в супе нашли.',
                    'Беркут берет взятки, если аккуратно предложить.'
                ],
                advices: [
                    'Не лезь на рожон, если здоровья мало.',
                    'Хочешь уважения? Бейся на арене.',
                    'Барыга любит косяки. Это тут главная валюта.'
                ]
            }
        };
    }

    getDialogueOptions(npcId) {
        const state = gameState.getState();
        const prison = state.prison || {};
        const options = [];

        switch (npcId) {
            case 'kosoy':
                options.push({ id: 'rumor', text: 'УЗНАТЬ СЛУХИ', type: 'info' });
                options.push({ id: 'advice', text: 'ПРОСИТЬ СОВЕТ', type: 'info' });

                if ((prison.respect || 0) >= 30 && !prison.gang) {
                    options.push({ id: 'gangs', text: 'ПРО ГРУППИРОВКИ', type: 'action' });
                }
                break;

            case 'funt':
                options.push({ id: 'trade', text: 'ТОРГОВЛЯ', type: 'action' });
                options.push({ id: 'quest', text: 'ДЕЛО К ТЕБЕ', type: 'action' });
                break;

            case 'major':
                options.push({ id: 'bribe', text: 'ПРЕДЛОЖИТЬ ВЗЯТКУ', type: 'action aggro' });
                options.push({ id: 'report', text: 'ДОНЕСТИ НА КОГО-ТО', type: 'info' });
                break;

            case 'shifty':
                options.push({ id: 'gamble', text: 'ИГРАТЬ В КАРТЫ', type: 'action' });
                options.push({ id: 'buy_info', text: 'КУПИТЬ ИНФУ', type: 'action' });
                break;
        }

        options.push({ id: 'exit', text: 'КОНЕЦ СВЯЗИ', type: 'exit' });
        return options;
    }

    handleDialogAction(npcId, actionId) {
        if (!this.dialogues[npcId]) {
            return "Мне нечего тебе сказать. Проваливай.";
        }

        if (actionId === 'rumor' && this.dialogues[npcId].rumors) {
            const list = this.dialogues[npcId].rumors;
            return list[Math.floor(Math.random() * list.length)];
        }
        if (actionId === 'advice' && this.dialogues[npcId].advices) {
            const list = this.dialogues[npcId].advices;
            return list[Math.floor(Math.random() * list.length)];
        }

        return "Система связи дала сбой. Повтори позже.";
    }
}

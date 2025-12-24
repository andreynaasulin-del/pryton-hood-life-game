/**
 * CASINO DATA
 * Configuration and metadata for Casino games and progression.
 */
export const CASINO_DATA = {
    games: [
        { id: 'slots', name: 'Cyber Slots', icon: 'cherry', desc: 'Классика Притона' },
        { id: 'dice', name: 'Кости', icon: 'dices', desc: 'Уличный азарт' },
        { id: 'roulette', name: 'Рулетка', icon: 'rotate-cw', desc: 'Черное или Красное' },
        { id: 'blackjack', name: 'Блэкджек', icon: 'spade', desc: 'Обыграй дилера' },
        { id: 'thimbles', name: 'Напёрстки', icon: 'cup-soda', desc: 'Следи за руками' },
        { id: 'crash', name: 'Крэш', icon: 'rocket', desc: 'Вовремя спрыгни' }
    ],
    exchange: {
        buyRate: 10,
        sellRate: 9.5,
        fee: 0.05
    }
};

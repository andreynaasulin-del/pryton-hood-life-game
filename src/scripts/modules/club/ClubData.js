/**
 * CLUB DATA - Constants and Static Data
 * Все константы для клуба (биты, темы, площадки, лейблы, etc.)
 */

export const ClubData = {
    // Beats library
    beats: [
        { id: 'opium', name: 'Opium Type', icon: 'eye-off', bpm: 150, vibe: 'пустота', price: 0, mood: 'chaos' },
        { id: 'lake', name: 'Lake Type', icon: 'flame', bpm: 145, vibe: 'хаос', price: 600, mood: 'chaos' },
        { id: 'industrial', name: 'Industrial', icon: 'zap', bpm: 155, vibe: 'ярость', price: 700, mood: 'chaos' },
        { id: 'iron', name: 'Iron Type', icon: 'target', bpm: 150, vibe: 'злость', price: 800, mood: 'chaos' },
        { id: 'drift', name: 'Chrome Drift', icon: 'car', bpm: 130, vibe: 'дрифт', price: 400, mood: 'chaos' },
        { id: 'cold_drill', name: 'Cold Drill', icon: 'building-2', bpm: 140, vibe: 'холод', price: 800, mood: 'survival' },
        { id: 'swamp', name: 'Swamp Type', icon: 'skull', bpm: 135, vibe: 'сырость', price: 500, mood: 'chaos' },
        { id: 'emo', name: 'Emo-Rap', icon: 'heart-crack', bpm: 85, vibe: 'боль', price: 700, mood: 'survival' },
        { id: 'rnb', name: 'R&B', icon: 'heart', bpm: 90, vibe: 'нежность', price: 900, mood: 'music' },
        { id: 'hiphop', name: 'Hip-Hop', icon: 'mic-2', bpm: 95, vibe: 'олдскул', price: 600, mood: 'music' },
        { id: 'custom', name: 'Custom', icon: 'sparkles', bpm: '???', vibe: 'твой', price: 5000, mood: 'music', premium: true }
    ],

    // Lyrics topics
    topics: [
        { id: 'void', name: 'Пустота', icon: 'moon', path: 'survival', desc: 'Когда ничего не чувствуешь' },
        { id: 'paranoia', name: 'Паранойя', icon: 'eye', path: 'chaos', desc: 'Они следят. Или нет?' },
        { id: 'escape', name: 'Побег', icon: 'plane', path: 'music', desc: 'Отсюда. Куда угодно.' },
        { id: 'grid', name: 'Система', icon: 'grid', path: 'survival', desc: 'Матрица. Бетон. Рутина.' },
        { id: 'glitch', name: 'Глитч', icon: 'zap-off', path: 'chaos', desc: 'Сбой в программе' },
        { id: 'memories', name: 'Призраки', icon: 'ghost', path: 'music', desc: 'Те, кого больше нет' }
    ],

    // Stage venues
    venues: [
        { id: 'open_mic', name: 'Подвал', icon: 'mic', cost: 0, fame: 5, energy: 15, minFame: 0 },
        { id: 'local_club', name: 'Бар на районе', icon: 'building', cost: 500, fame: 20, energy: 30, minFame: 50 },
        { id: 'big_club', name: 'Underground площадка', icon: 'warehouse', cost: 2000, fame: 50, energy: 50, minFame: 200 },
        { id: 'festival', name: 'Нелегальный рейв', icon: 'tent', cost: 5000, fame: 150, energy: 80, minFame: 500, seasonal: 'summer' }
    ],

    // Collaboration artists
    collabArtists: [
        {
            id: 'rookie',
            name: 'MC Подвал',
            icon: 'mic',
            style: 'underground',
            price: 0,
            qualityBonus: 5,
            viralBonus: 0.02,
            desc: 'Начинающий МС из соседнего двора',
            minFame: 0
        },
        {
            id: 'melodic',
            name: 'Крюк',
            icon: 'music',
            style: 'melodic',
            price: 500,
            qualityBonus: 10,
            viralBonus: 0.05,
            desc: 'Пишет крючки, которые застревают в голове',
            minFame: 30
        },
        {
            id: 'hype',
            name: 'ХАЙП',
            icon: 'trending-up',
            style: 'hype',
            price: 1500,
            qualityBonus: 15,
            viralBonus: 0.15,
            desc: 'Всё что он трогает — вирусится',
            minFame: 100
        },
        {
            id: 'legend',
            name: 'Тень',
            icon: 'ghost',
            style: 'legend',
            price: 5000,
            qualityBonus: 25,
            viralBonus: 0.25,
            desc: 'Легенда андеграунда. Никто не видел его лица.',
            minFame: 300
        },
        {
            id: 'producer',
            name: 'БитМейкер',
            icon: 'sliders',
            style: 'producer',
            price: 3000,
            qualityBonus: 20,
            viralBonus: 0.10,
            desc: 'Его биты звучат на всех районах',
            minFame: 150
        }
    ],

    // Record Labels
    labels: [
        {
            id: 'underground',
            name: 'Подвал Records',
            icon: 'home',
            tier: 'common',
            minFame: 30,
            minTracks: 3,
            signBonus: 500,
            royaltyRate: 0.1,
            fameMultiplier: 1.2,
            desc: 'Маленький, но душевный лейбл'
        },
        {
            id: 'street',
            name: 'Улица Продакшн',
            icon: 'map-pin',
            tier: 'rare',
            minFame: 100,
            minTracks: 6,
            signBonus: 2000,
            royaltyRate: 0.15,
            fameMultiplier: 1.5,
            desc: 'Уважение на районе'
        },
        {
            id: 'major',
            name: 'ПРИТОН МЬЮЗИК',
            icon: 'building',
            tier: 'epic',
            minFame: 300,
            minTracks: 10,
            signBonus: 10000,
            royaltyRate: 0.25,
            fameMultiplier: 2.0,
            desc: 'Большие деньги, большие возможности'
        },
        {
            id: 'legend',
            name: 'VOID EMPIRE',
            icon: 'crown',
            tier: 'legendary',
            minFame: 1000,
            minTracks: 15,
            signBonus: 50000,
            royaltyRate: 0.35,
            fameMultiplier: 3.0,
            desc: 'Легенды подписаны здесь'
        }
    ],

    // Radio Stations
    radioStations: [
        { id: 'pirate', name: 'Пиратское FM', icon: 'radio', cost: 100, playsBoost: 500, fansBoost: 5, minFame: 0 },
        { id: 'local', name: 'Районное Радио', icon: 'antenna', cost: 500, playsBoost: 2000, fansBoost: 20, minFame: 50 },
        { id: 'city', name: 'Городская Волна', icon: 'broadcast', cost: 2000, playsBoost: 10000, fansBoost: 100, minFame: 200 },
        { id: 'federal', name: 'Федеральный Эфир', icon: 'globe', cost: 10000, playsBoost: 50000, fansBoost: 500, minFame: 500 }
    ]
};

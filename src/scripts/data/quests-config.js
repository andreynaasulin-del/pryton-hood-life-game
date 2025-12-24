/**
 * QUEST DATABASE v4.2
 * Narrative progression and mission data for "Дух Притона"
 */
export const QUESTS = {
    // === PROLOGUE: THE AWAKENING ===
    story_hustle: {
        id: 'story_hustle',
        npc: 'shadow',
        title: 'Уличная школа',
        description: 'Твоя Тень требует действия. Выйди на улицу и покажи, что ты еще жив. Проверь свои силы в "Суете".',
        type: 'main',
        objectives: [
            { id: 'hustle', type: 'action_completed', target: 3, current: 0, actionId: 'street_hustle' },
            { id: 'cash_check', type: 'kpi_reached', target: 1000, current: 0, kpi: 'cash' }
        ],
        rewards: { energy: 30, stability: 15, cash: 500 },
        unlocks: ['story_studio_time'],
        minRelationship: 0
    },

    // === CHAPTER 1: THE SOUND OF VOID ===
    story_studio_time: {
        id: 'story_studio_time',
        npc: 'zef',
        title: 'Первый шум',
        description: 'Зеф оценил твою наглость. Теперь докажи, что у тебя есть голос. Запиши свой первый трек, используя вдохновение.',
        type: 'main',
        objectives: [
            { id: 'studio', type: 'action_completed', target: 1, current: 0, actionId: 'studio_session' },
            { id: 'fame_gain', type: 'kpi_reached', target: 50, current: 0, kpi: 'fame' }
        ],
        rewards: { fame: 50, respect: 20, cash: 1000 },
        unlocks: ['story_baryga_trust'],
        minRelationship: 10
    },

    // === CHAPTER 2: DARK TRANSACTIONS ===
    story_baryga_trust: {
        id: 'story_baryga_trust',
        npc: 'baryga',
        title: 'Грязные сделки',
        description: 'На улицах шепчутся о новичке. Барыга готов допустить тебя к "особому" товару, если ты потратишь немного кэша.',
        type: 'main',
        objectives: [
            { id: 'buy_gear', type: 'items_bought', target: 1, current: 0 },
            { id: 'chaos_level', type: 'stat_reached', target: 15, current: 0, stat: 'chaos' }
        ],
        rewards: { path_chaos: 10, respect: 30, energy: 50 },
        unlocks: ['story_doctor_session'],
        minRelationship: 5
    },

    // === CHAPTER 3: THE CLINICAL BLISS ===
    story_doctor_session: {
        id: 'story_doctor_session',
        npc: 'bones',
        title: 'Сеанс экзорцизма',
        description: 'Голоса становятся громче. Док Бонс может приглушить их... за правильную цену. Пройди полную сессию.',
        type: 'main',
        objectives: [
            { id: 'session', type: 'action_completed', target: 1, current: 0, actionId: 'doctor_session' },
            { id: 'adequacy_up', type: 'stat_reached', target: 80, current: 0, stat: 'adequacy' }
        ],
        rewards: { stability: 40, adequacy: 20, relationship: 10 },
        unlocks: [],
        minRelationship: 15
    },

    // === SIDE QUESTS ===
    side_casino_win: {
        id: 'side_casino_win',
        npc: 'spirit',
        title: 'Смех фортуны',
        description: 'Удача — переменчивая сука. Докажи ей свою преданность.',
        type: 'side',
        objectives: [
            { id: 'bet_win', type: 'action_completed', target: 5, current: 0, actionId: 'casino_win' }
        ],
        rewards: { lucky: 5, path_chaos: 2 }
    }
};

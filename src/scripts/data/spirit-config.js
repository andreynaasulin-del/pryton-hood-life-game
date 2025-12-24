/**
 * SPIRIT CONFIGURATION
 * Narrative data, challenges, city events, and thresholds.
 */
export const SPIRIT_CONFIG = {
    daily_goals: [
        { id: 'stability', title: 'Сдержать тьму', desc: 'Стабильность выше 70%', target: 70 },
        { id: 'money', title: 'Заработать на жизнь', desc: 'Получить 1000₽ за день', target: 1000 },
        { id: 'music', title: 'Создать контент', desc: 'Записать трек или текст', target: 1 }
    ],

    challenges: [
        { id: 'no_doctor', title: 'Три ночи без дока', desc: 'Выдержи три ночи без врача', target: 3 },
        { id: 'chaos_streak', title: 'Хаос в крови', desc: 'Три рискованных дела подряд', target: 3 }
    ],

    city_events: [
        { id: 'police_patrol', title: 'Усиленный патруль', desc: 'Риск грова повышен', duration: 2 },
        { id: 'club_promo', title: 'Ночь промо в клубе', desc: 'Стримы эффективнее', duration: 3 }
    ],

    phrases: {
        high_rage: [
            'ДУХ ПРИТОНА: "Хаос близок. Ты слышишь его зов?"',
            'ДУХ ПРИТОНА: "Твоя голова — это мой танцпол."'
        ],
        low_rage: [
            'ДУХ ПРИТОНА: "Ты держишься. Пока что."',
            'ДУХ ПРИТОНА: "Тишина... мне она не нравится."'
        ]
    }
};

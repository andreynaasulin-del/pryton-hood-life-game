/**
 * PRISON DATA - Game Configuration
 * Конфигурация тюрьмы: расписание, зоны, NPC, предметы
 */

export const PRISON_DATA = {
    // Тюремное расписание
    schedule: [
        { start: 0, end: 360, type: 'sleep', name: 'СОН', icon: 'moon' },
        { start: 360, end: 420, type: 'morning', name: 'ПОДЪЕМ', icon: 'sun' },
        { start: 420, end: 480, type: 'breakfast', name: 'ЗАВТРАК', icon: 'utensils' },
        { start: 480, end: 720, type: 'work', name: 'РАБОТА', icon: 'hammer' },
        { start: 720, end: 780, type: 'lunch', name: 'ОБЕД', icon: 'soup' },
        { start: 780, end: 1020, type: 'work', name: 'РАБОТА', icon: 'hammer' },
        { start: 1020, end: 1140, type: 'leisure', name: 'СВОБОДНОЕ ВРЕМЯ', icon: 'users' },
        { start: 1140, end: 1200, type: 'dinner', name: 'УЖИН', icon: 'coffee' },
        { start: 1200, end: 1320, type: 'leisure', name: 'ПРОВЕРКА', icon: 'eye' },
        { start: 1320, end: 1440, type: 'sleep', name: 'ОТБОЙ', icon: 'moon' }
    ],

    // Зоны тюрьмы
    zones: [
        { id: 'cell', name: 'Камера', icon: 'box', desc: 'Твой дом на ближайшие годы' },
        { id: 'yard', name: 'Дворик', icon: 'sun', desc: 'Воздух и турники' },
        { id: 'shizo', name: 'ШИЗО', icon: 'lock', desc: 'Бетонный мешок' },
        { id: 'work', name: 'Промзона', icon: 'factory', desc: 'Труд сделал человека' },
        { id: 'library', name: 'Библиотека', icon: 'book', desc: 'Тишина и знания' },
        { id: 'canteen', name: 'Столовая', icon: 'utensils', desc: 'Баланда по расписанию' }
    ],

    // Тюремные NPC
    npcs: [
        { id: 'kosoy', name: 'Косой', icon: 'eye-off', role: 'Смотрящий', color: '#f87171' },
        { id: 'funt', name: 'Фунт', icon: 'coins', role: 'Барыга', color: '#60a5fa' },
        { id: 'major', name: 'Майор Громов', icon: 'shield', role: 'Начальник режима', color: '#34d399' },
        { id: 'shifty', name: 'Шустрый', icon: 'zap', role: 'Шестерка', color: '#fbbf24' }
    ],

    // Крафт и предметы
    crafting: [
        {
            id: 'zatochka',
            name: 'Заточка',
            icon: 'knife',
            materials: { spoon: 1 },
            result: { fear: 10, respect: 5 },
            desc: 'Холодное оружие из ложки',
            risk: 30
        },
        {
            id: 'key',
            name: 'Отмычка',
            icon: 'key',
            materials: { wire: 2 },
            result: { escape: 15 },
            desc: 'Нужна для замков',
            risk: 50
        }
    ],

    // Ранги в тюрьме
    ranks: [
        { id: 'chort', name: 'Черт', minRespect: -100, maxRespect: -50 },
        { id: 'muzhik', name: 'Мужик', minRespect: -50, maxRespect: 50 },
        { id: 'blatnoy', name: 'Блатной', minRespect: 50, maxRespect: 150 },
        { id: 'avtoritet', name: 'Авторитет', minRespect: 150, maxRespect: 500 }
    ]
};

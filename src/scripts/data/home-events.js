/**
 * Home Events System - Случайные события в притоне
 * Добавляет жизни и непредсказуемости
 */

export const HOME_EVENTS = {
    // === НЕЙТРАЛЬНЫЕ СОБЫТИЯ ===
    delivery: {
        id: 'delivery',
        title: 'Доставка!',
        icon: '📦',
        desc: 'Курьер звонит в дверь. Похоже, кто-то заказал еду.',
        type: 'neutral',
        chance: 0.15,
        minDay: 1,
        actions: [
            { label: 'Принять заказ', effect: { hunger: 30, cash: -150 } },
            { label: 'Отменить', effect: {} }
        ]
    },

    neighbor_noise: {
        id: 'neighbor_noise',
        title: 'Соседи шумят',
        icon: '🔊',
        desc: 'Сверху опять включили дрель. Сосредоточиться сложно.',
        type: 'neutral',
        chance: 0.12,
        minDay: 2,
        condition: (state) => !state.home?.upgrades?.includes('soundproofing'),
        actions: [
            { label: 'Терпеть', effect: { mood: -10, stability: -5 } },
            { label: 'Пойти поговорить', effect: { energy: -10 }, random: { mood: [5, -15] } }
        ]
    },

    power_outage: {
        id: 'power_outage',
        title: 'Отключили свет!',
        icon: '💡',
        desc: 'Электричество вырубилось. В темноте сидеть не комильфо.',
        type: 'bad',
        chance: 0.08,
        minDay: 3,
        condition: (state) => !state.home?.upgrades?.includes('generator'),
        actions: [
            { label: 'Ждать', effect: { mood: -15, stability: -10 }, duration: 120 },
            { label: 'Позвонить в УК', effect: { energy: -5 } }
        ]
    },

    // === ПОЗИТИВНЫЕ СОБЫТИЯ ===
    found_money: {
        id: 'found_money',
        title: 'Нашёл кошелёк!',
        icon: '💰',
        desc: 'Под матрасом обнаружилась заначка. Откуда она тут?',
        type: 'good',
        chance: 0.05,
        minDay: 4,
        actions: [
            { label: 'Забрать', effect: { cash: [100, 500] } }
        ]
    },

    inspiration_strike: {
        id: 'inspiration_strike',
        title: 'Вдохновение!',
        icon: '💡',
        desc: 'В голову пришла гениальная идея для трека.',
        type: 'good',
        chance: 0.1,
        minDay: 2,
        condition: (state) => state.home?.studioQuality > 0,
        actions: [
            { label: 'Записать сразу!', effect: { energy: -20 }, bonus: { musicPath: 5 } },
            { label: 'Запомнить на потом', effect: { mood: 5 } }
        ]
    },

    old_friend_call: {
        id: 'old_friend_call',
        title: 'Звонок старого друга',
        icon: '📞',
        desc: 'Кореш из прошлой жизни. Говорит, есть тема.',
        type: 'neutral',
        chance: 0.08,
        minDay: 5,
        actions: [
            { label: 'Выслушать', effect: { mood: 10 }, unlocks: 'quest_old_friend' },
            { label: 'Отмазаться', effect: {} }
        ]
    },

    // === ОПАСНЫЕ СОБЫТИЯ ===
    police_check: {
        id: 'police_check',
        title: '⚠️ ПРОВЕРКА!',
        icon: '🚔',
        desc: 'В дверь стучат. "Откройте, полиция!"',
        type: 'danger',
        chance: 0.06,
        minDay: 5,
        condition: (state) => state.grow?.active || state.home?.upgrades?.includes('home_lab'),
        actions: [
            { label: 'Открыть', effect: {}, risk: { arrest: 0.3 } },
            {
                label: 'Прятаться', effect: { anxiety: 30, stability: -20 },
                condition: (state) => state.home?.upgrades?.includes('panic_room'),
                safeOutcome: true
            }
        ]
    },

    robbery_attempt: {
        id: 'robbery_attempt',
        title: '🚨 ОГРАБЛЕНИЕ!',
        icon: '🔓',
        desc: 'Кто-то пытается вскрыть замок!',
        type: 'danger',
        chance: 0.04,
        minDay: 7,
        condition: (state) => !state.home?.upgrades?.includes('camera'),
        actions: [
            { label: 'Вызвать ментов', effect: { cash: -500 } },
            { label: 'Дать отпор', effect: { health: [-20, 0], respect: [5, 15] } },
            { label: 'Дать ограбить', effect: { cash: [-500, -2000] } }
        ]
    },

    gas_leak: {
        id: 'gas_leak',
        title: 'Запах газа!',
        icon: '💨',
        desc: 'В квартире пахнет газом. Нужно что-то делать.',
        type: 'danger',
        chance: 0.03,
        minDay: 8,
        actions: [
            { label: 'Открыть окна', effect: { health: -5 } },
            { label: 'Вызвать службу', effect: { cash: -300 }, duration: 60 },
            { label: 'Игнорировать', effect: { health: -30, adequacy: -10 } }
        ]
    },

    // === СОЦИАЛЬНЫЕ СОБЫТИЯ ===
    unexpected_visitor: {
        id: 'unexpected_visitor',
        title: 'Гость без звонка',
        icon: '🚪',
        desc: 'Кто-то звонит в дверь. Ты никого не ждёшь.',
        type: 'neutral',
        chance: 0.1,
        minDay: 3,
        actions: [
            { label: 'Открыть', effect: {}, random: { event: ['visitor_dealer', 'visitor_fan', 'visitor_taxman'] } },
            { label: 'Не открывать', effect: { stability: 5 } }
        ]
    },

    visitor_fan: {
        id: 'visitor_fan',
        title: 'Фанат у двери!',
        icon: '🎤',
        desc: 'Какой-то пацан узнал адрес. Говорит, ты его вдохновил.',
        type: 'good',
        chance: 0,
        triggered: true,
        actions: [
            { label: 'Пообщаться', effect: { mood: 15, respect: 5, subscribers: 10 } },
            { label: 'Послать', effect: { respect: -5 } }
        ]
    },

    visitor_dealer: {
        id: 'visitor_dealer',
        title: 'Барыга заглянул',
        icon: '💊',
        desc: 'Человек с товаром. Может, надо?',
        type: 'neutral',
        chance: 0,
        triggered: true,
        actions: [
            { label: 'Взять', effect: { cash: -500, withdrawal: -40, health: -10 } },
            { label: 'Отказать', effect: {} }
        ]
    },

    visitor_taxman: {
        id: 'visitor_taxman',
        title: 'Налоговая!',
        icon: '📋',
        desc: 'Инспектор интересуется твоими доходами.',
        type: 'bad',
        chance: 0,
        triggered: true,
        condition: (state) => state.kpis?.cash > 20000,
        actions: [
            { label: 'Заплатить штраф', effect: { cash: -2000 } },
            { label: 'Отмазаться', effect: {}, risk: { fine: 0.5, amount: 5000 } }
        ]
    },

    // === ПОГОДНЫЕ СОБЫТИЯ ===
    storm: {
        id: 'storm',
        title: 'Гроза!',
        icon: '⛈️',
        desc: 'За окном гроза. Атмосферно, но тревожно.',
        type: 'neutral',
        chance: 0.08,
        minDay: 1,
        effects: { anxiety: 10, stability: -5, mood: [-5, 10] },
        duration: 180
    },

    heatwave: {
        id: 'heatwave',
        title: 'Жара!',
        icon: '🌡️',
        desc: 'В притоне как в бане. Кондиционера нет.',
        type: 'bad',
        chance: 0.06,
        minDay: 5,
        condition: (state) => !state.home?.upgrades?.includes('air_purifier'),
        effects: { energy: -15, health: -5, mood: -10 },
        duration: 240
    }
};

// Выбрать случайное событие на основе условий
export function getRandomHomeEvent(state) {
    const eligibleEvents = Object.values(HOME_EVENTS).filter(event => {
        // Проверка минимального дня
        if (event.minDay && state.day < event.minDay) return false;

        // Triggered события не выбираются случайно
        if (event.triggered) return false;

        // Проверка условия
        if (event.condition && !event.condition(state)) return false;

        // Проверка шанса
        if (Math.random() > event.chance) return false;

        return true;
    });

    if (eligibleEvents.length === 0) return null;

    return eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
}

// Получить события по типу
export function getEventsByType(type) {
    return Object.values(HOME_EVENTS).filter(e => e.type === type);
}

// Получить конкретное событие
export function getHomeEvent(id) {
    return HOME_EVENTS[id] || null;
}

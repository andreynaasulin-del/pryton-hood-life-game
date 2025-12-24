/**
 * STORY MANIFESTO v1.0
 * Centralized Narrative definition for Spirit of the Den.
 */

export const STORY_ARCS = {
    LEGEND: {
        id: 'legend',
        name: 'ПУТЬ ЛЕГЕНДЫ',
        desc: 'Слава, стадионы, вспышки камер и риск потерять себя.',
        focus: 'fame'
    },
    GHOST: {
        id: 'ghost',
        name: 'ПУТЬ ПРИЗРАКА',
        desc: 'Невидимый делец. Большие деньги, нулевойHeat, никакой славы.',
        focus: 'cash'
    },
    PROPHET: {
        id: 'prophet',
        name: 'ПУТЬ ПРОРОКА',
        desc: 'Психонавтика, изменение сознания и связь с Духом Притона.',
        focus: 'adequacy'
    }
};

export const STORY_BEATS = {
    // STARTING BEATS
    INTRO_PRODUCER: {
        id: 'intro_producer',
        npc: 'producer',
        trigger: 'game_start',
        messages: [
            { id: 'p1', text: 'Йоу, ты как? Слышал, ты вернулся в игру.', delay: 2000 },
            { id: 'p2', text: 'У меня есть пара битов, которые только тебя и ждали. Но сейчас в городе жарко.', delay: 4000 },
            { id: 'p3', text: 'Зайди в студию, когда будешь готов. Обсудим контракт.', delay: 6000 }
        ],
        choices: [
            { text: 'Скоро буду.', action: (state) => { /* Update rel */ }, next: 'intro_p_ok' },
            { text: 'Мне сейчас не до музыки.', action: (state) => { /* Alternative path */ }, next: 'intro_p_deny' }
        ]
    },

    BARYGA_FIRST_REACH: {
        id: 'baryga_reach',
        npc: 'baryga',
        trigger: 'first_deal',
        messages: [
            { id: 'b1', text: 'Нам надо поговорить. Либо ты с нами, либо ты против нас.', delay: 2000 },
            { id: 'b2', text: 'В Притоне завелись крысы. Мне нужен кто-то надежный.', delay: 4000 }
        ],
        choices: [
            { text: 'Я в деле.', next: 'b_loyal' },
            { text: 'Я работаю один.', next: 'b_solo' }
        ]
    }
};

export const WORLD_EVENTS = [
    {
        id: 'police_raid_alert',
        title: '⚠️ РЕЙД В ЦЕНТРЕ',
        text: 'Мусора перекрыли Невский. Всем залечь на дно.',
        condition: (state) => state.heat > 50
    },
    {
        id: 'studio_fire',
        title: '🔥 СКАНДАЛ В СЕТИ',
        text: 'Твой последний трек забанили за пропаганду хаоса. Слава растет!',
        condition: (state) => state.fame > 1000
    }
];

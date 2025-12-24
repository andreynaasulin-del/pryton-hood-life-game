import { GAME_CONFIG, GAME_VERSION } from './constants.js';
import { stages } from './stages.js';

export const INITIAL_STATE = {
    version: GAME_VERSION,
    day: 1,
    time: 0,
    currentStage: 0,
    stats: {
        health: 100,
        energy: 100,
        hunger: 100,
        mood: 100,
        withdrawal: 0,
        stability: 100,
        adequacy: 100,
        anxiety: 0,
        trip: 0,
        synchronization: 80
    },
    status: 'FREE',
    neuro: {
        interfaceLevel: 1,
        stability: 100,
        maxStability: 100,
        corruption: 0,
        pests: [], // AI fragments/parasites
        implants: [], // Installed cybernetics
        shards: []    // Data shards
    },
    kpis: {
        cash: 5000,
        respect: 0,
        fame: 0,
        releases: 0,
        subscribers: 0
    },
    paths: {
        music: 0,
        chaos: 0,
        survival: 0
    },
    spirit: {
        rage: 0,
        trust: 0
    },
    farm: {
        lastSync: Date.now(),
        coins: 0,
        temp: 22,
        cryptoRate: 100,
        gpus: [], // Installed GPU IDs
        coolers: [], // Installed Cooler IDs
        isStrangeDataMining: false,
        // Greenhouse System
        greenhouse: {
            unlocked: true, // For now
            activeView: 'mining', // 'mining' or 'greenhouse'
            slots: Array(4).fill(null).map(() => ({ seedId: null, progress: 0, quality: 100, health: 100 })),
            waterLevel: 100,
            lightLevel: 100,
            smellLevel: 0,
            carbonFilter: false
        }
    },
    quests: {
        active: [],
        completed: [],
        available: []
    },
    dailyGoal: null,
    inventory: [],
    achievements: {},
    log: [],
    story: { seenEvents: {}, firstActionDone: false },
    home: { level: 1, upgrades: [], cleanliness: 50 },
    prison: {
        rank: 'muzhik',
        authority: 0,
        currency: { cigarettes: 10, tea: 0 },
        sentence: { totalDays: 1825, daysServed: 0, daysRemaining: 1825 }
    },
    casino: {
        unlocked: false,
        chips: 0,
        casinoLevel: 1,
        casinoXP: 0,
        dailySpent: 0,
        suspicionLevel: 0,
        lastResult: null
    },
    doctor: {
        adequacy: 50,
        trust: 0,
        currentMode: 'normal',
        availableModes: ['normal'],
        sessions: 0,
        lastSuggestion: null
    },
    syndicate: {
        active: false,
        debt: 0,
        nextPaymentDay: 3,
        currentPayment: 1500,
        daysOverdue: 0,
        warnings: 0,
        totalPaid: 0
    },
    chat: {
        conversations: {}
    },
    world: {
        activeEvents: [],
        history: [],
        multipliers: {
            gpus: 1.0,
            electronics: 1.0,
            club_income: 1.0,
            fame_gain: 1.0,
            pharma: 1.0,
            crypto_rate: 1.0
        }
    },
    stages: JSON.parse(JSON.stringify(stages))
};

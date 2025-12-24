/**
 * Home Upgrades Data - Система апгрейдов притона
 * Каждый апгрейд даёт пассивные бонусы и открывает новые действия
 */

export const HOME_UPGRADES = {
    // === БАЗОВЫЕ КОМНАТЫ ===
    mattress: {
        id: 'mattress',
        name: 'Нормальный матрас',
        desc: 'Не на полу же спать. Хоть какой-то комфорт.',
        icon: 'bed',
        price: 2000,
        tier: 'common',
        category: 'comfort',
        effects: {
            sleepBonus: 10, // +10% к восстановлению от сна
            passiveHealth: 1 // +1 HP в день
        },
        unlocks: ['power_nap'] // Открывает действие "Быстрый сон"
    },

    microwave: {
        id: 'microwave',
        name: 'Микроволновка',
        desc: 'Разогреть дошик теперь — дело минуты.',
        icon: 'zap',
        price: 3500,
        tier: 'common',
        category: 'kitchen',
        effects: {
            foodBonus: 15 // +15% к восстановлению от еды
        },
        unlocks: ['cook_meal']
    },

    mini_fridge: {
        id: 'mini_fridge',
        name: 'Мини-холодильник',
        desc: 'Еда не портится. Революция.',
        icon: 'refrigerator',
        price: 5000,
        tier: 'common',
        category: 'kitchen',
        effects: {
            hungerDecay: -5 // Медленнее теряешь сытость
        },
        requires: ['microwave']
    },

    // === СТУДИЯ ===
    basic_mic: {
        id: 'basic_mic',
        name: 'USB микрофон',
        desc: 'Fifine или типа того. Для начала сойдёт.',
        icon: 'mic',
        price: 4000,
        tier: 'common',
        category: 'studio',
        effects: {
            studioQuality: 5 // +5% к качеству записи
        },
        unlocks: ['record_demo']
    },

    soundproofing: {
        id: 'soundproofing',
        name: 'Звукоизоляция',
        desc: 'Яичные лотки на стенах. Классика жанра.',
        icon: 'volume-x',
        price: 8000,
        tier: 'rare',
        category: 'studio',
        effects: {
            studioQuality: 10,
            neighborRelations: 10 // Меньше ссор с соседями
        },
        requires: ['basic_mic']
    },

    pro_interface: {
        id: 'pro_interface',
        name: 'Аудио интерфейс',
        desc: 'Focusrite Scarlett. Теперь звук — огонь.',
        icon: 'sliders',
        price: 15000,
        tier: 'rare',
        category: 'studio',
        effects: {
            studioQuality: 20,
            musicPath: 2 // +2 к пути музыки при записи
        },
        requires: ['soundproofing']
    },

    monitors: {
        id: 'monitors',
        name: 'Студийные мониторы',
        desc: 'Yamaha HS5. Слышишь каждую ошибку.',
        icon: 'speaker',
        price: 25000,
        tier: 'epic',
        category: 'studio',
        effects: {
            studioQuality: 25,
            musicPath: 3
        },
        requires: ['pro_interface']
    },

    // === БЕЗОПАСНОСТЬ ===
    door_lock: {
        id: 'door_lock',
        name: 'Нормальный замок',
        desc: 'Перестань открывать дверь ножом.',
        icon: 'lock',
        price: 3000,
        tier: 'common',
        category: 'security',
        effects: {
            robberyChance: -20 // -20% шанс ограбления
        }
    },

    camera: {
        id: 'camera',
        name: 'Камера наблюдения',
        desc: 'Видишь кто стоит под дверью.',
        icon: 'video',
        price: 7000,
        tier: 'rare',
        category: 'security',
        effects: {
            robberyChance: -30,
            raidWarning: true // Предупреждение о рейдах
        },
        requires: ['door_lock']
    },

    safe: {
        id: 'safe',
        name: 'Сейф',
        desc: 'Маленький, но надёжный. Для самого важного.',
        icon: 'shield',
        price: 12000,
        tier: 'rare',
        category: 'security',
        effects: {
            maxCash: 20000, // +20000 к лимиту кэша
            itemProtection: true // Предметы не теряются при аресте
        },
        requires: ['door_lock']
    },

    // === КОМФОРТ И СТАТУС ===
    led_lights: {
        id: 'led_lights',
        name: 'RGB подсветка',
        desc: 'Неоновый вайб. Притон светится как клуб.',
        icon: 'lightbulb',
        price: 2500,
        tier: 'common',
        category: 'vibe',
        effects: {
            moodBonus: 5 // +5% к настроению
        }
    },

    gaming_chair: {
        id: 'gaming_chair',
        name: 'Геймерское кресло',
        desc: 'Спина скажет спасибо. Или нет.',
        icon: 'armchair',
        price: 8000,
        tier: 'rare',
        category: 'comfort',
        effects: {
            workBonus: 10, // +10% к эффективности домашней работы
            passiveHealth: 2
        }
    },

    air_purifier: {
        id: 'air_purifier',
        name: 'Очиститель воздуха',
        desc: 'Фильтрует дым, запахи, паранойю.',
        icon: 'wind',
        price: 10000,
        tier: 'rare',
        category: 'comfort',
        effects: {
            healthBonus: 10,
            growRisk: -15 // Меньше запах от грова
        }
    },

    blackout_curtains: {
        id: 'blackout_curtains',
        name: 'Затемнение',
        desc: 'Блэкаут шторы. Спи хоть целый день.',
        icon: 'moon',
        price: 4500,
        tier: 'common',
        category: 'comfort',
        effects: {
            sleepBonus: 15,
            stabilityBonus: 5
        }
    },

    // === ПРОДВИНУТЫЕ АПГРЕЙДЫ ===
    generator: {
        id: 'generator',
        name: 'Генератор',
        desc: 'Свет отключат — ты продолжишь.',
        icon: 'battery-charging',
        price: 20000,
        tier: 'epic',
        category: 'utility',
        effects: {
            powerBackup: true, // Защита от отключений
            passiveIncome: 50 // Можешь майнить
        }
    },

    grow_tent: {
        id: 'grow_tent',
        name: 'Гроу-тент',
        desc: 'Профессиональная теплица. Тихо и эффективно.',
        icon: 'tent',
        price: 35000,
        tier: 'epic',
        category: 'production',
        effects: {
            growSpeed: 2, // x2 скорость роста
            growRisk: -30,
            growYield: 50 // +50% урожай
        },
        unlocks: ['advanced_grow']
    },

    streaming_setup: {
        id: 'streaming_setup',
        name: 'Стриминг сетап',
        desc: 'Камера, свет, OBS. Готов к эфиру.',
        icon: 'tv',
        price: 30000,
        tier: 'epic',
        category: 'studio',
        effects: {
            streamBonus: 50, // +50% к доходу от стримов
            subscriberGain: 20 // +20% подписчиков
        },
        requires: ['pro_interface'],
        unlocks: ['pro_stream']
    },

    // === ЛЕГЕНДАРНЫЕ ===
    panic_room: {
        id: 'panic_room',
        name: 'Тайная комната',
        desc: 'За шкафом. Полиция не найдёт.',
        icon: 'door-closed',
        price: 100000,
        tier: 'legendary',
        category: 'security',
        effects: {
            raidProtection: true, // Защита от рейдов
            arrestChance: -50,
            maxCash: 50000
        },
        requires: ['safe', 'camera']
    },

    home_lab: {
        id: 'home_lab',
        name: 'Домашняя лаборатория',
        desc: 'Химия, биология, что угодно. Осторожно.',
        icon: 'flask',
        price: 150000,
        tier: 'legendary',
        category: 'production',
        effects: {
            craftingUnlock: true,
            passiveIncome: 500
        },
        requires: ['grow_tent']
    },

    professional_studio: {
        id: 'professional_studio',
        name: 'Профессиональная студия',
        desc: 'Как у топовых продюсеров. Мечта.',
        icon: 'music-2',
        price: 200000,
        tier: 'legendary',
        category: 'studio',
        effects: {
            studioQuality: 50,
            musicPath: 5,
            passiveIncome: 300, // Можешь сдавать в аренду
            fameBonus: 20
        },
        requires: ['monitors', 'streaming_setup']
    }
};

// Новые домашние действия, открываемые апгрейдами
export const HOME_ACTIONS_UPGRADES = {
    power_nap: {
        id: 'power_nap',
        icon: 'moon',
        title: 'Быстрый сон',
        meta: '+20 энергии (1ч)',
        time: 60,
        effects: { energy: 20 },
        paths: { survival: 1 },
        category: 'home',
        requires: ['mattress']
    },

    cook_meal: {
        id: 'cook_meal',
        icon: 'chef-hat',
        title: 'Приготовить еду',
        meta: '+40 сытости, +5 настроения (30м)',
        time: 30,
        effects: { hunger: 40, mood: 5, cash: -100 },
        paths: { survival: 1 },
        category: 'home',
        requires: ['microwave']
    },

    record_demo: {
        id: 'record_demo',
        icon: 'disc',
        title: 'Записать демо',
        meta: '+музыкальный путь, шанс хайпа (2ч)',
        time: 120,
        effects: { energy: -20 },
        paths: { music: 3 },
        category: 'home',
        requires: ['basic_mic']
    },

    advanced_grow: {
        id: 'advanced_grow',
        icon: 'sprout',
        title: 'Автоматический гров',
        meta: 'Гров работает сам, меньше внимания',
        time: 15,
        effects: { growRisk: -20 },
        paths: { chaos: 1 },
        category: 'farm',
        requires: ['grow_tent']
    },

    pro_stream: {
        id: 'pro_stream',
        icon: 'radio',
        title: 'Профессиональный стрим',
        meta: '+подписчики, +кэш, +слава (4ч)',
        time: 240,
        effects: { subscribers: [20, 50], cash: [200, 500], energy: -30 },
        paths: { music: 2 },
        category: 'home',
        requires: ['streaming_setup']
    },

    meditation: {
        id: 'meditation',
        icon: 'brain',
        title: 'Глубокая медитация',
        meta: '+стабильность, +адекватность (1ч)',
        time: 60,
        effects: { stability: 25, adequacy: 15, anxiety: -20 },
        paths: { survival: 2 },
        category: 'home'
    },

    workout_home: {
        id: 'workout_home',
        icon: 'dumbbell',
        title: 'Домашняя тренировка',
        meta: '+здоровье, -энергия (45м)',
        time: 45,
        effects: { health: 15, energy: -20, mood: 10 },
        paths: { survival: 1 },
        category: 'home'
    },

    clean_apartment: {
        id: 'clean_apartment',
        icon: 'spray-can',
        title: 'Уборка притона',
        meta: '+стабильность, +настроение (1ч)',
        time: 60,
        effects: { stability: 15, mood: 10, energy: -15 },
        paths: { survival: 1 },
        category: 'home'
    },

    conspiracy_research: {
        id: 'conspiracy_research',
        icon: 'search',
        title: 'Ресёрч в даркнете',
        meta: '+адекватность(?), шанс найти инфу (2ч)',
        time: 120,
        effects: { adequacy: [-5, 10], stability: -10 },
        paths: { chaos: 2 },
        category: 'home'
    },

    call_dealer: {
        id: 'call_dealer',
        icon: 'phone',
        title: 'Позвонить барыге',
        meta: 'Заказать доставку домой',
        time: 15,
        effects: { cash: -500, withdrawal: -30, health: -5 },
        paths: { chaos: 1 },
        category: 'home'
    }
};

// Категории апгрейдов для UI
export const UPGRADE_CATEGORIES = {
    comfort: { name: 'Комфорт', icon: 'home', color: '#60a5fa' },
    kitchen: { name: 'Кухня', icon: 'utensils', color: '#f59e0b' },
    studio: { name: 'Студия', icon: 'music', color: '#a855f7' },
    security: { name: 'Безопасность', icon: 'shield', color: '#ef4444' },
    vibe: { name: 'Вайб', icon: 'sparkles', color: '#ec4899' },
    utility: { name: 'Утилиты', icon: 'settings', color: '#64748b' },
    production: { name: 'Производство', icon: 'factory', color: '#22c55e' }
};

// Функции для работы с апгрейдами
export function getUpgrade(id) {
    return HOME_UPGRADES[id] || null;
}

export function getUpgradesByCategory(category) {
    return Object.values(HOME_UPGRADES).filter(u => u.category === category);
}

export function getAvailableUpgrades(purchasedUpgrades = []) {
    return Object.values(HOME_UPGRADES).filter(upgrade => {
        // Already purchased
        if (purchasedUpgrades.includes(upgrade.id)) return false;

        // Check requirements
        if (upgrade.requires) {
            const hasAll = upgrade.requires.every(req => purchasedUpgrades.includes(req));
            if (!hasAll) return false;
        }

        return true;
    });
}

export function calculateUpgradeEffects(purchasedUpgrades = []) {
    const effects = {
        sleepBonus: 0,
        foodBonus: 0,
        studioQuality: 0,
        passiveHealth: 0,
        passiveIncome: 0,
        maxCash: 0,
        moodBonus: 0,
        healthBonus: 0,
        workBonus: 0,
        stabilityBonus: 0,
        robberyChance: 0,
        growRisk: 0,
        growSpeed: 1,
        growYield: 0,
        musicPath: 0,
        hungerDecay: 0,
        streamBonus: 0,
        subscriberGain: 0,
        fameBonus: 0,
        arrestChance: 0,
        neighborRelations: 0
    };

    purchasedUpgrades.forEach(upgradeId => {
        const upgrade = HOME_UPGRADES[upgradeId];
        if (upgrade && upgrade.effects) {
            Object.entries(upgrade.effects).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    effects[key] = (effects[key] || 0) + value;
                } else if (typeof value === 'boolean') {
                    effects[key] = value;
                }
            });
        }
    });

    return effects;
}

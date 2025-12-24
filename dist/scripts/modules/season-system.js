/**
 * Season System - 4 Seasons Over 1 Year
 * Autumn (grусть) -> Winter (мрак) -> Spring (мания) -> Summer (чилл)
 */

export const YEAR_LENGTH = 120; // дней в году (30 дней на сезон)
export const SEASON_LENGTH = 30; // дней в сезоне

export const SEASONS = {
    autumn: {
        id: 'autumn',
        name: 'Осень',
        icon: '🍂',
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #92400e, #78350f)',
        mood: 'Грусть и меланхолия',
        days: [1, 30],
        weather: { rain: 0.6, cloudy: 0.3, clear: 0.1, snow: 0, fog: 0 },
        effects: {
            moodPerDay: -3,
            creativityBonus: 1.15,
            energyMod: 1.0,
            dangerMod: 1.0,
            socialMod: 0.9
        },
        events: [
            { day: 1, name: 'Начало пути', desc: 'Первый день в притоне. Листья падают.' },
            { day: 15, name: 'Середина осени', desc: 'Серость и дождь. Душа ноет.' },
            { day: 25, name: 'Хэллоуин', desc: 'Дух притона особенно активен.' }
        ],
        ambience: 'Серое небо, дождь стучит по окнам, листья гниют на асфальте.'
    },
    winter: {
        id: 'winter',
        name: 'Зима',
        icon: '❄️',
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
        mood: 'Страх и мрак',
        days: [31, 60],
        weather: { snow: 0.5, fog: 0.3, cloudy: 0.15, clear: 0.05, rain: 0 },
        effects: {
            moodPerDay: -5,
            creativityBonus: 1.0,
            energyMod: 0.8,
            dangerMod: 1.4,
            socialMod: 0.7
        },
        events: [
            { day: 35, name: 'Первый снег', desc: 'Город накрыло белым саваном.' },
            { day: 45, name: 'Новый Год', desc: 'Все празднуют. Ты один.' },
            { day: 55, name: 'Самая тёмная ночь', desc: 'День длится 4 часа. Тьма давит.' }
        ],
        ambience: 'Темно. Холодно. Снег скрипит под ногами. Фонари еле светят.'
    },
    spring: {
        id: 'spring',
        name: 'Весна',
        icon: '🌸',
        color: '#22c55e',
        gradient: 'linear-gradient(135deg, #166534, #15803d)',
        mood: 'Мания и энергия',
        days: [61, 90],
        weather: { rain: 0.35, clear: 0.4, cloudy: 0.2, fog: 0.05, snow: 0 },
        effects: {
            moodPerDay: +5,
            creativityBonus: 1.2,
            energyMod: 1.3,
            dangerMod: 1.1,
            socialMod: 1.2
        },
        events: [
            { day: 65, name: 'Оттепель', desc: 'Снег тает. Надежда просыпается.' },
            { day: 75, name: 'Весенний подъём', desc: 'Энергия прёт. Сложно остановиться.' },
            { day: 85, name: 'Цветение', desc: 'Город расцветает. Маниакальный драйв.' }
        ],
        ambience: 'Лужи, солнце, птицы орут. Всё движется, всё меняется.'
    },
    summer: {
        id: 'summer',
        name: 'Лето',
        icon: '☀️',
        color: '#fbbf24',
        gradient: 'linear-gradient(135deg, #b45309, #92400e)',
        mood: 'Движ и чилл',
        days: [91, 120],
        weather: { clear: 0.7, cloudy: 0.2, rain: 0.1, fog: 0, snow: 0 },
        effects: {
            moodPerDay: +3,
            creativityBonus: 1.1,
            energyMod: 1.1,
            dangerMod: 0.9,
            socialMod: 1.4
        },
        events: [
            { day: 95, name: 'Белые ночи', desc: 'Солнце не заходит. Город бессонный.' },
            { day: 105, name: 'Фестиваль', desc: 'Музыка на улицах. Твой шанс.' },
            { day: 118, name: 'Конец года', desc: 'Круг замкнулся. Что дальше?' }
        ],
        ambience: 'Жарко. Солнце до полуночи. Все на улице. Музыка везде.'
    }
};

export class SeasonSystem {
    constructor() {
        this.currentSeason = null;
        this.dayInSeason = 1;
    }

    /**
     * Get season by day number
     */
    getSeasonByDay(day) {
        const normalizedDay = ((day - 1) % YEAR_LENGTH) + 1;

        if (normalizedDay <= 30) return SEASONS.autumn;
        if (normalizedDay <= 60) return SEASONS.winter;
        if (normalizedDay <= 90) return SEASONS.spring;
        return SEASONS.summer;
    }

    /**
     * Get day within current season (1-30)
     */
    getDayInSeason(day) {
        const normalizedDay = ((day - 1) % YEAR_LENGTH) + 1;
        return ((normalizedDay - 1) % SEASON_LENGTH) + 1;
    }

    /**
     * Get year number (1, 2, 3...)
     */
    getYear(day) {
        return Math.floor((day - 1) / YEAR_LENGTH) + 1;
    }

    /**
     * Get season progress (0-100%)
     */
    getSeasonProgress(day) {
        return (this.getDayInSeason(day) / SEASON_LENGTH) * 100;
    }

    /**
     * Get year progress (0-100%)
     */
    getYearProgress(day) {
        const normalizedDay = ((day - 1) % YEAR_LENGTH) + 1;
        return (normalizedDay / YEAR_LENGTH) * 100;
    }

    /**
     * Get weather for current season
     */
    getWeather(day) {
        const season = this.getSeasonByDay(day);
        const rand = Math.random();
        let cumulative = 0;

        for (const [weather, chance] of Object.entries(season.weather)) {
            cumulative += chance;
            if (rand <= cumulative) return weather;
        }
        return 'clear';
    }

    /**
     * Get today's event if any
     */
    getTodayEvent(day) {
        const season = this.getSeasonByDay(day);
        const dayInSeason = this.getDayInSeason(day);
        return season.events.find(e => e.day === dayInSeason) || null;
    }

    /**
     * Apply daily season effects to state
     */
    applyDailyEffects(gameState) {
        const day = gameState.time?.day || gameState.day || 1;
        const season = this.getSeasonByDay(day);
        const effects = season.effects;

        // Apply mood change
        if (effects.moodPerDay) {
            const currentMood = gameState.stats?.mood || 50;
            gameState.stats.mood = Math.max(0, Math.min(100, currentMood + effects.moodPerDay));
        }

        // Apply energy modifier (affects max energy recovery)
        gameState.seasonMods = {
            energy: effects.energyMod,
            danger: effects.dangerMod,
            social: effects.socialMod,
            creativity: effects.creativityBonus
        };

        // Check for season event
        const event = this.getTodayEvent(day);
        if (event) {
            return {
                hasEvent: true,
                event: event,
                season: season
            };
        }

        return { hasEvent: false, season: season };
    }

    /**
     * Get all seasons for display
     */
    getAllSeasons() {
        return Object.values(SEASONS);
    }

    /**
     * Get season summary for UI
     */
    getSeasonSummary(day) {
        const season = this.getSeasonByDay(day);
        const dayInSeason = this.getDayInSeason(day);
        const year = this.getYear(day);
        const progress = this.getSeasonProgress(day);

        return {
            season: season,
            dayInSeason: dayInSeason,
            year: year,
            progress: progress,
            daysLeft: SEASON_LENGTH - dayInSeason,
            nextSeason: this.getNextSeason(season.id)
        };
    }

    getNextSeason(currentSeasonId) {
        const order = ['autumn', 'winter', 'spring', 'summer'];
        const idx = order.indexOf(currentSeasonId);
        return SEASONS[order[(idx + 1) % 4]];
    }
}

// Singleton instance
const seasonSystem = new SeasonSystem();
export default seasonSystem;

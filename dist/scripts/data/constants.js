// Game Constants and Configuration

// Game Version
export const GAME_VERSION = '4.2';

// MIME types for dev server
export const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Game configuration
export const GAME_CONFIG = {
  PORT: 4173, // Default port for client-side code
  MAX_LOG_ENTRIES: 20,
  HOURS_PER_DAY: 24,
  MINUTES_PER_HOUR: 60,
  MAX_STAT_VALUE: 100,
  MIN_STAT_VALUE: 0,
  GROW_DAYS_TO_HARVEST: 7,
  SPIRIT_RAGE_UPDATE_INTERVAL: 30000, // 30 seconds
  BUILD_DEBOUNCE_DELAY: 120 // ms
};

// Spirit rage thresholds
export const SPIRIT_STATES = {
  OBSERVING: { rage: 0, state: 'наблюдает', noise: 'спокойный' },
  WHISPERING: { rage: 20, state: 'шепчет', noise: 'нервный' },
  CHAOS: { rage: 50, state: 'в восторге от хаоса', noise: 'на грани рейда' }
};

// Path endings
export const ENDINGS = {
  MUSIC: 'music',
  CHAOS: 'chaos',
  SURVIVAL: 'survival',
  PURE_CHAOS: 'pure_chaos',
  THIN_LINE: 'thin_line',
  TOXIC_MASTER: 'toxic_master',
  NO_DOCTOR: 'no_doctor'
};

// Mini-game types
export const MINI_GAMES = [
  'studio_session',
  'toxic_relax',
  'casino_bones',
  'casino_slots',
  'casino_wheel',
  'hack_atm'
];

// Timing game settings
export const TIMING_GAME = {
  ZONE_START_MIN: 20,
  ZONE_START_MAX: 80,
  ZONE_WIDTH: 20,
  SPEED_MIN: 1,
  SPEED_MAX: 3
};

// Risk game settings
export const RISK_GAME = {
  RISK_MIN: 1,
  RISK_MAX: 10,
  REWARD_MULTIPLIER: 10,
  SUCCESS_BASE: 20
};

// ATM Hack settings
export const ATM_GAME = {
  LEVELS: 3,
  DIGITS: 4,
  SPEED_BASE: 50, // ms per change
  SPEED_INCREMENT: 10, // faster per level
  REWARD_BASE: 500
};

// Casino game settings
export const CASINO_GAMES = {
  BONES: {
    MIN_BET: 100,
    MAX_BET: 5000,
    WIN_MULTIPLIER: 1.9
  },
  SLOTS: {
    SYMBOLS: ['💿', '💸', '👻', '🎧', '[сиг]'],
    PAYOUTS: {
      '👻👻👻': 10,
      '💸💸💸': 7,
      '💿💿💿': 5,
      '🎧🎧🎧': 3,
      '[сиг][сиг][сиг]': 3,
      '👻👻*': 2,
      '👻*👻': 2,
      '*👻👻': 2
    },
    EXPECTED_VALUE: 0.92
  },
  WHEEL: {
    SEGMENTS: [
      { label: '+₽5000', cash: 5000, chance: 0.1 },
      { label: '+₽10000', cash: 10000, chance: 0.05 },
      { label: '+Респект', respect: 15, chance: 0.15 },
      { label: '+Хаос', chaos: 10, stability: -5, chance: 0.2 },
      { label: '-Ставка x2', cashMultiplier: -2, chance: 0.2 },
      { label: 'Рейд', raid: true, chance: 0.1 },
      { label: 'Бонус ДУХА', spiritBonus: true, chance: 0.05 },
      { label: 'Госпитализация', hospitalization: true, chance: 0.15 }
    ]
  }
};

// Casino progression system
export const CASINO_PROGRESSION = {
  LEVELS: {
    1: {
      name: 'Залетный',
      maxBet: 100,
      unlockedGames: ['bones', 'slots'],
      xpRequired: 0
    },
    2: {
      name: 'Игрок',
      maxBet: 500,
      unlockedGames: ['bones', 'slots'],
      xpRequired: 100
    },
    3: {
      name: 'VIP',
      maxBet: 5000,
      unlockedGames: ['bones', 'slots', 'wheel'],
      xpRequired: 500
    }
  },
  XP_PER_BET: 1, // XP gained per bet placed (win or lose)
  XP_PER_BIG_WIN: 5, // Bonus XP for wins over 1000 chips
  RAID_TRIGGER_SUSPICION: 100, // Suspicion level that triggers raid
  RAID_CHANCE_AFTER_BIG_WIN: 0.05, // 5% chance after big win
  RAID_BLOCK_DURATION: 5 * 60 * 1000 // 5 minutes in milliseconds
};

// Home Achievements Configuration
export const HOME_ACHIEVEMENTS_CONFIG = [
  {
    id: 'first_release',
    title: 'Первый релиз',
    description: 'Выпустить первый трек в сеть.'
  },
  {
    id: 'street_authority',
    title: 'Уличный авторитет',
    description: 'Набрать 100 очков респекта.'
  },
  {
    id: 'night_shift',
    title: 'Ночная смена',
    description: 'Работать в студии до 04:00 утра.'
  },
  {
    id: 'stream_king',
    title: 'Король стримов',
    description: 'Провести 5 успешных стримов подряд.'
  },
  {
    id: 'quiet_trip',
    title: 'Тихий трип',
    description: 'Прожить 3 дня без криминала и шума.'
  },
  {
    id: 'casino_whale',
    title: 'Кит',
    description: 'Выиграть 5000 фишек за один заход.'
  },
  {
    id: 'broke_af',
    title: 'На мели',
    description: 'Остаться с 0 кэша и долгами.'
  },
  {
    id: 'survivor',
    title: 'Выживший',
    description: 'Пережить рейд охраны без потерь.'
  }
];

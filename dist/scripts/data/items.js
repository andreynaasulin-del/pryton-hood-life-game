export const ITEMS = [
  // ========== УЛИЦА (Street Food & Energy) ==========
  {
    id: 'doshik',
    name: 'Дошик',
    desc: 'Лапша быстрого приготовления. Классика жанра.',
    effectText: '+20 сытости',
    price: 150,
    emoji: '🍜',
    icon: 'soup',
    category: 'street',
    tier: 'common',
    consumable: true,
    effect: (gameState) => gameState.updateStat('hunger', 20)
  },
  {
    id: 'shawarma',
    name: 'Шаурма',
    desc: 'С подворотни у метро. Мясо непонятное, но вкусно.',
    effectText: '+45 сытости',
    price: 350,
    emoji: '🌯',
    icon: 'sandwich',
    category: 'street',
    tier: 'common',
    consumable: true,
    effect: (gameState) => gameState.updateStat('hunger', 45)
  },
  {
    id: 'redbull',
    name: 'Red Bull',
    desc: 'Крылья? Не, но бодрит на несколько часов.',
    effectText: '+30 энергии',
    price: 250,
    emoji: '🥤',
    icon: 'coffee',
    category: 'street',
    tier: 'common',
    consumable: true,
    effect: (gameState) => gameState.updateStat('energy', 30)
  },
  {
    id: 'tornado',
    name: 'Tornado',
    desc: 'Энергетик для тех, кому Red Bull слабоват.',
    effectText: '+55 энергии, -5 HP',
    price: 450,
    emoji: '⚡',
    icon: 'zap',
    category: 'street',
    tier: 'rare',
    consumable: true,
    effect: (gameState) => {
      gameState.updateStat('energy', 55);
      gameState.updateStat('health', -5);
    }
  },
  {
    id: 'cigarettes',
    name: 'Сигареты "Пётр I"',
    desc: 'Тяжелые. Утро начинается не с кофе.',
    effectText: '+15 стабильности, -5 HP',
    price: 200,
    emoji: '🚬',
    icon: 'cigarette',
    category: 'street',
    tier: 'common',
    consumable: true,
    effect: (gameState) => {
      gameState.updateStat('stability', 15);
      gameState.updateStat('health', -5);
    }
  },
  {
    id: 'cheap_vodka',
    name: 'Чекушка',
    desc: 'Маленькая, но злая. Согревает душу.',
    effectText: '+20 Mood, +10 Stability, -10 HP, +10 Withdrawal',
    price: 300,
    emoji: '🍶',
    icon: 'wine',
    category: 'street',
    tier: 'common',
    consumable: true,
    effect: (gameState) => {
      gameState.updateStat('mood', 20);
      gameState.updateStat('stability', 10);
      gameState.updateStat('health', -10);
      gameState.updateStat('withdrawal', 10);
    }
  },
  {
    id: 'banquet',
    name: 'Банкет',
    desc: 'Нормальный обед в нормальном заведении. Редкость.',
    effectText: '+80 сытости, +25 энергии',
    price: 1500,
    emoji: '🍽️',
    icon: 'utensils',
    category: 'street',
    tier: 'epic',
    consumable: true,
    effect: (gameState) => {
      gameState.updateStat('hunger', 80);
      gameState.updateStat('energy', 25);
    }
  },

  // ========== ФАРМА (Medical) ==========
  {
    id: 'bandage',
    name: 'Бинт',
    desc: 'Базовая перевязка. Остановит кровь.',
    effectText: '+15 HP',
    price: 200,
    emoji: '🩹',
    icon: 'bandage',
    category: 'pharma',
    tier: 'common',
    consumable: true,
    effect: (gameState) => gameState.updateStat('health', 15)
  },
  {
    id: 'painkillers',
    name: 'Кетанов',
    desc: 'Снимает любую боль. На время.',
    effectText: '+30 HP',
    price: 500,
    emoji: '💊',
    icon: 'pill',
    category: 'pharma',
    tier: 'common',
    consumable: true,
    effect: (gameState) => gameState.updateStat('health', 30)
  },
  {
    id: 'medkit',
    name: 'Армейская аптечка',
    desc: 'Всё что нужно для полевой хирургии.',
    effectText: '+60 HP',
    price: 2000,
    emoji: '🏥',
    icon: 'cross',
    category: 'pharma',
    tier: 'rare',
    consumable: true,
    effect: (gameState) => gameState.updateStat('health', 60)
  },
  {
    id: 'vitamins',
    name: 'Витаминки',
    desc: 'Компливит. Чтобы не развалиться окончательно.',
    effectText: '+5 HP, +5 Energy',
    price: 150,
    emoji: '💊',
    icon: 'pill',
    category: 'pharma',
    tier: 'common',
    consumable: true,
    effect: (gameState) => {
      gameState.updateStat('health', 5);
      gameState.updateStat('energy', 5);
    }
  },
  {
    id: 'adrenaline',
    name: 'Адреналин',
    desc: 'Шприц в сердце. Как в кино.',
    effectText: '+100 Energy, -20 Stability',
    price: 3000,
    emoji: '💉',
    icon: 'zap',
    category: 'pharma',
    tier: 'epic',
    consumable: true,
    effect: (gameState) => {
      gameState.updateStat('energy', 100);
      gameState.updateStat('stability', -20);
    }
  },
  {
    id: 'stabilizer',
    name: 'Феназепам',
    desc: 'Успокоительное. Рецепт не нужен, если знаешь кого.',
    effectText: '+40 стабильности',
    price: 1200,
    emoji: '💉',
    icon: 'syringe',
    category: 'pharma',
    tier: 'rare',
    consumable: true,
    effect: (gameState) => gameState.updateStat('stability', 40)
  },
  {
    id: 'nanomed',
    name: 'Экспериментальная сыворотка',
    desc: 'Украдено из военной лаборатории. Работает.',
    effectText: 'Полное восстановление HP',
    price: 15000,
    emoji: '🧬',
    icon: 'dna',
    category: 'pharma',
    tier: 'legendary',
    consumable: true,
    effect: (gameState) => gameState.updateStat('health', 100)
  },

  // ========== СТУДИЯ (Equipment) ==========
  {
    id: 'earbuds',
    name: 'AirPods Pro',
    desc: 'Слушай биты в любом месте.',
    effectText: '+5% качество записи',
    price: 8000,
    emoji: '🎧',
    icon: 'headphones',
    category: 'studio',
    tier: 'common',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.equipment = s.equipment || {};
      s.equipment.earbuds = true;
      s.studioBonus = (s.studioBonus || 0) + 5;
    }
  },
  {
    id: 'mic_sm58',
    name: 'Shure SM58',
    desc: 'Легенда. Им пели все — от Кобейна до Моргенштерна.',
    effectText: '+15% качество записи',
    price: 25000,
    emoji: '🎤',
    icon: 'mic',
    category: 'studio',
    tier: 'rare',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.equipment = s.equipment || {};
      s.equipment.mic = true;
      s.studioBonus = (s.studioBonus || 0) + 15;
    }
  },
  {
    id: 'laptop_mac',
    name: 'MacBook Pro',
    desc: 'FL Studio, Ableton, Logic — всё твоё.',
    effectText: '+200₽/день пассивно, +10% студия',
    price: 120000,
    emoji: '💻',
    icon: 'laptop',
    category: 'studio',
    tier: 'epic',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.equipment = s.equipment || {};
      s.equipment.laptop = true;
      s.passiveIncome = (s.passiveIncome || 0) + 200;
      s.studioBonus = (s.studioBonus || 0) + 10;
    }
  },
  {
    id: 'gold_chain',
    name: 'Золотая цепь 585',
    desc: '150 грамм чистого флекса. Все видят — ты поднялся.',
    effectText: '+50 Fame, +10% в баттлах',
    price: 180000,
    emoji: '⛓️',
    icon: 'link',
    category: 'studio',
    tier: 'legendary',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.equipment = s.equipment || {};
      s.equipment.chain = true;
      if (!s.music) s.music = { fame: 0 };
      s.music.fame = (s.music.fame || 0) + 50;
      s.battleBonus = (s.battleBonus || 0) + 10;
    }
  },

  // ========== ЧЁРНЫЙ РЫНОК (Black Market) ==========
  {
    id: 'burner',
    name: 'Левый телефон',
    desc: 'Не привязан ни к чему. Для дел.',
    effectText: '-10% подозрение',
    price: 5000,
    emoji: '📱',
    icon: 'smartphone',
    category: 'black',
    tier: 'common',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.suspicionReduction = (s.suspicionReduction || 0) + 10;
    }
  },
  {
    id: 'city_map',
    name: 'Карта ходов',
    desc: 'Все закоулки, дворы, крыши. Составлена опытным бегуном.',
    effectText: '-20% риск на улице',
    price: 8000,
    emoji: '🗺️',
    icon: 'map',
    category: 'black',
    tier: 'rare',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.riskReduction = (s.riskReduction || 0) + 20;
    }
  },
  {
    id: 'hack_tool',
    name: 'Флиппер Зеро',
    desc: 'Мультитул хакера. Открывает шлагбаумы, глушит сигналы.',
    effectText: '+15% шанс успеха взлома',
    price: 12000,
    emoji: '📟',
    icon: 'wifi-off',
    category: 'black',
    tier: 'rare',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.hackingSkill = (s.hackingSkill || 0) + 15;
    }
  },
  {
    id: 'police_scanner',
    name: 'Полицейская рация',
    desc: 'Слушай их частоты. Знай где облавы.',
    effectText: '-30% риск ареста',
    price: 35000,
    emoji: '📻',
    icon: 'radio',
    category: 'black',
    tier: 'epic',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.arrestRiskReduction = (s.arrestRiskReduction || 0) + 30;
    }
  },
  {
    id: 'fake_passport',
    name: 'Поддельный паспорт',
    desc: 'Полный комплект: паспорт, права, СНИЛС. Биометрия.',
    effectText: '-50% риск ареста, новая личность',
    price: 250000,
    emoji: '🪪',
    icon: 'id-card',
    category: 'black',
    tier: 'legendary',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.arrestRiskReduction = (s.arrestRiskReduction || 0) + 50;
      s.fakeIdentity = true;
    }
  },
  {
    id: 'vip_bratva',
    name: 'Крыша от братвы',
    desc: 'Серьёзные люди теперь на твоей стороне.',
    effectText: '+100 Fame, иммунитет от гопников',
    price: 500000,
    emoji: '🤝',
    icon: 'handshake',
    category: 'black',
    tier: 'legendary',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.vip = true;
      s.bratvaProtection = true;
      if (!s.music) s.music = { fame: 0 };
      s.music.fame = (s.music.fame || 0) + 100;
    }
  },

  // ========== СПЕЦИАЛЬНЫЕ (Special) ==========
  {
    id: 'secret_stash',
    name: 'Секретный тайник',
    desc: 'Место, где можно спрятать всё самое ценное.',
    effectText: '+10,000 к лимиту кэша',
    price: 25000,
    emoji: '📦',
    icon: 'package',
    category: 'special',
    tier: 'epic',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.kpis.maxCash = (s.kpis.maxCash || 50000) + 10000;
      gameState.addLogEntry('Теперь можно хранить больше лаве.', 'good');
    }
  },
  {
    id: 'crypto_wallet',
    name: 'Крипто-ферма',
    desc: 'Майнит потихоньку. Капает пока ты спишь.',
    effectText: '+150₽/день пассивно',
    price: 15000,
    emoji: '💻',
    icon: 'cpu',
    category: 'special',
    tier: 'rare',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.passiveIncome = (s.passiveIncome || 0) + 150;
      gameState.addLogEntry('Ферма запущена. Крипта капает.', 'good');
    }
  },
  {
    id: 'golden_ticket',
    name: 'Золотой пропуск',
    desc: 'Доступ в VIP-зону клуба и респект от охраны.',
    effectText: 'VIP статус в клубе',
    price: 50000,
    emoji: '🎫',
    icon: 'ticket',
    category: 'special',
    tier: 'legendary',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      if (!s.club) s.club = {};
      s.club.vipAccess = true;
      gameState.addLogEntry('Теперь ты VIP. Охрана кланяется.', 'good');
    }
  },
  {
    id: 'shadow_vpn',
    name: 'Shadow VPN',
    desc: 'Твой трафик не видит даже товарищ майор.',
    effectText: '-10% риск взлома',
    price: 10000,
    emoji: '🛡️',
    icon: 'shield-check',
    category: 'special',
    tier: 'rare',
    consumable: false,
    effect: (gameState) => {
      const s = gameState.getState();
      s.securityLevel = (s.securityLevel || 0) + 10;
      gameState.addLogEntry('Трафик зашифрован.', 'good');
    }
  },
  // ========== НЕЙРО-АРТЕФАКТЫ (Neuro Arifacts / Lore) ==========
  {
    id: 'shard_os_history',
    name: 'Дата-осколок: История PRYTON_OS',
    desc: 'Поврежденный файл о разработке первой версии нейросети.',
    effectText: '+5% Синхронизация, Открывает архив',
    price: 5000,
    emoji: '💾',
    icon: 'database',
    category: 'black',
    tier: 'rare',
    consumable: true,
    effect: (gameState) => {
      gameState.updateNeuro('synchronization', 5);
      gameState.addLogEntry('ДАННЫЕ ИЗВЛЕЧЕНЫ: Проект "Притон" начался как попытка оцифровать сознание...', 'info');
    }
  },
  {
    id: 'neuro_calm',
    name: 'Нейро-стек: Спокойствие',
    desc: 'Патч для коры головного мозга. Снимает тремор.',
    effectText: '+25 Стабильность',
    price: 3500,
    emoji: '🌀',
    icon: 'activity',
    category: 'black',
    tier: 'rare',
    consumable: true,
    effect: (gameState) => gameState.updateNeuro('stability', 25)
  },
  {
    id: 'dopamine_injector',
    name: 'Дофаминовый инжектор',
    desc: 'Прямой впрыск в лимбическую систему. Эйфория гарантирована.',
    effectText: '+50 Mood, -15 Стабильность',
    price: 4500,
    emoji: '🧪',
    icon: 'flask-conical',
    category: 'street',
    tier: 'rare',
    consumable: true,
    effect: (gameState) => {
      gameState.updateStat('mood', 50);
      gameState.updateNeuro('stability', -15);
    }
  }
];

export const getItem = (id) => ITEMS.find(i => i.id === id);
export const getItemsByCategory = (category) => ITEMS.filter(i => i.category === category);

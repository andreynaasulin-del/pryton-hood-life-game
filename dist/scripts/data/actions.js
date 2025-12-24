// Game Actions Data - Curated for "ДУХ ПРИТОНА" vibe
export const actions = [
  // Музыка/контент
  {
    id: 'write_lyrics',
    icon: 'edit-3',
    title: 'Писать текст',
    meta: '+настрой, +стабильность (1ч)',
    time: 60,
    effects: { mood: 15, stability: 10 },
    paths: { music: 2 },
    category: 'home'
  },
  {
    id: 'studio_session',
    icon: 'mic-2',
    title: 'Студия: записать куплет',
    meta: '+релизы, –энергия (2ч)',
    time: 120,
    effects: { releases: 1, energy: -25 },
    paths: { music: 3 },
    category: 'home'
  },
  {
    id: 'street_concert',
    icon: 'music',
    title: 'Дворовый мини-концерт',
    meta: '+подписчики, +уважение, –энергия (1ч)',
    time: 60,
    effects: { subscribers: [5, 15], respect: [1, 3], energy: -15 },
    paths: { music: 2 },
    category: 'street'
  },
  {
    id: 'stream',
    icon: 'tv',
    title: 'Стрим из притона',
    meta: '+подписчики, +кэш, –настрой (3ч)',
    time: 180,
    effects: { subscribers: [10, 25], cash: [50, 150], mood: -10 },
    paths: { music: 2 },
    category: 'home'
  },
  // Новые домашние действия
  {
    id: 'meditation',
    icon: 'brain',
    title: 'Медитация',
    meta: '+стабильность, +адекватность (1ч)',
    time: 60,
    effects: { stability: 25, adequacy: 15, anxiety: -20 },
    paths: { survival: 2 },
    category: 'home'
  },
  {
    id: 'workout_home',
    icon: 'dumbbell',
    title: 'Домашняя тренировка',
    meta: '+здоровье, -энергия (45м)',
    time: 45,
    effects: { health: 15, energy: -20, mood: 10 },
    paths: { survival: 1 },
    category: 'home'
  },
  {
    id: 'clean_apartment',
    icon: 'spray-can',
    title: 'Уборка притона',
    meta: '+стабильность, +настроение (1ч)',
    time: 60,
    effects: { stability: 15, mood: 10, energy: -15 },
    paths: { survival: 1 },
    category: 'home'
  },
  {
    id: 'call_dealer',
    icon: 'phone',
    title: 'Позвонить барыге',
    meta: 'Заказать доставку, -ломка (15м)',
    time: 15,
    effects: { cash: -500, withdrawal: -30, health: -5 },
    paths: { chaos: 1 },
    category: 'home'
  },

  // Улица/криминал/движ
  {
    id: 'street_hustle',
    icon: 'zap',
    title: 'Уличные мутки',
    meta: '+кэш/+уважение, риск травмы (2ч)',
    time: 120,
    effects: { cash: [200, 600], respect: [2, 5], health: [-10, 0] },
    paths: { chaos: 2 },
    category: 'street'
  },
  {
    id: 'shop_lift',
    icon: 'shopping-bag',
    title: 'Магазин под шумок',
    meta: '+сытость, риск полиции (1ч)',
    time: 60,
    effects: { hunger: 30, stability: [-20, 0] },
    paths: { chaos: 1 },
    category: 'street'
  },
  {
    id: 'alley_fight',
    icon: 'crosshair',
    title: 'Подворотня: разборка',
    meta: '+уважение, риск травмы (1ч)',
    time: 60,
    effects: { respect: [3, 8], health: [-15, 0] },
    paths: { chaos: 2 },
    category: 'street'
  },
  {
    id: 'courier',
    icon: 'bike',
    title: 'Халтура курьером',
    meta: '+₽300–500, –энергия, –сытость (2ч)',
    time: 120,
    effects: { cash: [300, 500], energy: -20, hunger: -15 },
    category: 'street'
  },

  // Гров
  {
    id: 'start_grow',
    icon: 'leaf',
    title: 'Гров-комната: запуск',
    meta: 'начать выращивание (требует кэш)',
    time: 30,
    effects: { cash: -1500 },
    condition: 'grow_start',
    paths: { chaos: 3 },
    category: 'farm'
  },
  {
    id: 'tend_grow',
    icon: 'droplets',
    title: 'Гров: ухаживать',
    meta: 'снизить риск спалиться (30м)',
    time: 30,
    effects: { growRisk: -10 },
    condition: 'grow_active',
    paths: { chaos: 1 },
    category: 'farm'
  },
  {
    id: 'harvest_grow',
    icon: 'scissors',
    title: 'Гров: собрать и сбыть',
    meta: '+кэш, риск полиции',
    time: 60,
    effects: { cash: [800, 1200], stability: [-30, 0] },
    condition: 'grow_harvest',
    paths: { chaos: 2 },
    category: 'farm'
  },

  // Самосохранение/саморазрушение
  {
    id: 'toxic_relax',
    icon: 'flask-conical',
    title: 'Синтез вещества',
    meta: 'Химия, контроль процесса (2ч)',
    time: 120,
    effects: { creativity: 30, stability: -10, adequacy: -15 },
    paths: { chaos: 3 },
    category: 'home'
  },
  {
    id: 'doctor_visit',
    icon: 'heart-pulse',
    title: 'Врач и таблетки',
    meta: '+здоровье, –кэш (1ч)',
    time: 60,
    effects: { health: 25, cash: -500 },
    paths: { survival: 2 },
    category: 'street'
  },
  {
    id: 'sleep',
    icon: 'moon',
    title: 'Сон',
    meta: '+энергия, +здоровье (8ч)',
    time: 480,
    effects: { energy: 50, health: 15 },
    paths: { survival: 1 },
    category: 'home'
  },
  {
    id: 'eat_street_food',
    icon: 'utensils',
    title: 'Уличная еда',
    meta: '+сытость, риск отравления (30м)',
    time: 30,
    effects: { hunger: 25, health: [-5, 0], cash: -150 },
    paths: { survival: 1 },
    category: 'home'
  },
  {
    id: 'social_media_scroll',
    icon: 'smartphone',
    title: 'Скролл соцсетей',
    meta: '+подписчики, –настрой (45м)',
    time: 45,
    effects: { subscribers: [1, 5], mood: -10, energy: -5 },
    paths: { music: 1 },
    category: 'home'
  },
  // Новые Ходы (Social / Risky / Creative)
  {
    id: 'graffiti_bombing',
    icon: 'palette',
    title: 'Бомбинг на районе',
    meta: '+респект, +адреналин, риск полиции (2ч)',
    time: 120,
    effects: { respect: [5, 10], mood: 15, stability: -5 },
    paths: { chaos: 2 },
    category: 'street'
  },
  {
    id: 'hack_atm',
    icon: 'laptop',
    title: 'Скимминг банкомата',
    meta: '+кэш, высокий риск, +интеллект (3ч)',
    time: 180,
    effects: { cash: [1000, 3000], stability: -15, adequacy: -5 },
    paths: { chaos: 3 },
    category: 'street'
  },
  {
    id: 'freestyle_battle',
    icon: 'mic',
    title: 'Фристайл баттл',
    meta: '+респект, +хайп, шанс провала (2ч)',
    time: 120,
    effects: { respect: [10, 25], mood: 10, energy: -20 },
    paths: { music: 3 },
    category: 'street'
  },
  {
    id: 'meditate_roof',
    icon: 'wind',
    title: 'Медитация на крыше',
    meta: '+стабильность, +адекватность (1ч)',
    time: 60,
    effects: { stability: 20, adequacy: 10, mood: 5 },
    paths: { survival: 2 },
    category: 'home'
  },
  {
    id: 'rummage_trash',
    icon: 'trash-2',
    title: 'Порыться в мусоре',
    meta: 'шанс найти артефакт/еду, –респект (30м)',
    time: 30,
    effects: { respect: -5, hunger: [0, 10], cash: [0, 50] },
    paths: { survival: 1 },
    category: 'street'
  },
  {
    id: 'gym_basement',
    icon: 'dumbbell',
    title: 'Качалка в подвале',
    meta: '+здоровье, +сила, –энергия (1.5ч)',
    time: 90,
    effects: { health: 10, energy: -30, mood: 10 },
    paths: { survival: 2 },
    category: 'street'
  },
  {
    id: 'distribute_flyers',
    icon: 'file-text',
    title: 'Расклейка афиш',
    meta: '+подписчики, +хайп, –энергия (2ч)',
    time: 120,
    effects: { subscribers: [5, 15], energy: -25 },
    paths: { music: 1 },
    category: 'street'
  },
  {
    id: 'eavesdrop',
    icon: 'ear',
    title: 'Подслушать разговоры',
    meta: 'узнать слухи, +инфа, риск (1ч)',
    time: 60,
    effects: { stability: -5, adequacy: 5 }, // Info gain simulated via stats/logs
    paths: { chaos: 1 },
    category: 'street'
  },
  {
    id: 'brew_coffee',
    icon: 'coffee',
    title: 'Сварить чифир',
    meta: '+энергия, –здоровье (15м)',
    time: 15,
    effects: { energy: 40, health: -5, stability: -5 },
    paths: { survival: 1 },
    category: 'home'
  }
];

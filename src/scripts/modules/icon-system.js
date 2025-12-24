/**
 * Icon System - Централизованная система иконок
 * Заменяет эмодзи на профессиональные Lucide иконки
 */

// Маппинг эмодзи на Lucide иконки
export const ICON_MAP = {
    // Ресурсы и валюта
    '💰': 'coins',
    '💵': 'banknote',
    '🪙': 'circle-dollar-sign',
    '💎': 'gem',

    // Здоровье и состояние
    '❤️': 'heart',
    '💊': 'pill',
    '🩹': 'bandage',
    '🏥': 'hospital',
    '🧪': 'test-tube',
    '💉': 'syringe',

    // Энергия и сила
    '⚡': 'zap',
    '🔥': 'flame',
    '💪': 'dumbbell',
    '🦾': 'biceps-flexed',

    // Еда и напитки
    '🍔': 'sandwich',
    '🍕': 'pizza',
    '☕': 'coffee',
    '🍺': 'beer',

    // Курение и вещества  
    '🚬': 'cigarette',
    '🌿': 'leaf',

    // Игры и казино
    '🎰': 'dices',
    '🎲': 'dice-5',
    '🎮': 'gamepad-2',
    '🏆': 'trophy',
    '⭐': 'star',

    // Музыка и студия
    '🎵': 'music',
    '🎤': 'mic',
    '🎧': 'headphones',

    // Локации
    '🏠': 'home',
    '🏪': 'store',
    '🎪': 'tent',

    // Тюрьма и опасность
    '⛓️': 'link',
    '🔒': 'lock',
    '🔓': 'unlock',
    '⚠️': 'alert-triangle',
    '💀': 'skull',
    '☠️': 'skull',
    '🆘': 'siren',

    // Бой и оружие
    '🔫': 'crosshair',
    '👊': 'hand-fist',
    '🗡️': 'sword',
    '⚔️': 'swords',
    '🛡️': 'shield',

    // Интерфейс
    '✅': 'check',
    '❌': 'x',
    '📝': 'file-text',
    '🔧': 'wrench',
    '📦': 'package',
    '🎁': 'gift',
    '👁️': 'eye',
    '🎯': 'target',
    '💻': 'laptop',
    '📱': 'smartphone',
    '🔑': 'key',

    // Персонажи
    '👤': 'user',
    '🎭': 'drama',

    // Психика
    '🧠': 'brain',
    '😵': 'meh',
    '💤': 'moon',

    // Награды
    '🥇': 'medal',
    '🥈': 'medal',
    '🥉': 'medal'
};

// Генерирует HTML для Lucide иконки
export function icon(name, size = 16, className = '') {
    return `<i data-lucide="${name}" class="icon ${className}" style="width:${size}px;height:${size}px;display:inline-block;vertical-align:middle;"></i>`;
}

// Заменяет эмодзи в строке на Lucide иконки
export function replaceEmojis(text, size = 16) {
    let result = text;
    for (const [emoji, iconName] of Object.entries(ICON_MAP)) {
        result = result.replaceAll(emoji, icon(iconName, size));
    }
    return result;
}

// Инициализирует иконки на странице (вызывать после вставки HTML)
export function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Шорткаты для частых иконок
export const icons = {
    cash: () => icon('coins', 16),
    health: () => icon('heart', 16),
    energy: () => icon('zap', 16),
    hunger: () => icon('sandwich', 16),
    respect: () => icon('star', 16),
    cigarette: () => icon('cigarette', 16),
    pill: () => icon('pill', 16),
    warning: () => icon('alert-triangle', 16),
    check: () => icon('check', 16),
    cross: () => icon('x', 16),
    lock: () => icon('lock', 16),
    unlock: () => icon('unlock', 16),
    music: () => icon('music', 16),
    mic: () => icon('mic', 16),
    dice: () => icon('dices', 16),
    home: () => icon('home', 16),
    store: () => icon('store', 16),
    prison: () => icon('link', 16),
    doctor: () => icon('stethoscope', 16),
    casino: () => icon('dices', 16),
    club: () => icon('music-2', 16),
    street: () => icon('map-pin', 16),
    farm: () => icon('sprout', 16)
};

// Глобальный экспорт для использования в onclick и т.д.
window.iconSystem = {
    icon,
    replaceEmojis,
    initIcons,
    icons,
    ICON_MAP
};

export default { icon, replaceEmojis, initIcons, icons, ICON_MAP };

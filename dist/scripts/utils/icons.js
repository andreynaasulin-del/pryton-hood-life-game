/**
 * Icon System
 * Centralized icon management to replace emojis
 * Using Lucide icons (lightweight, modern alternative to Font Awesome)
 */

export const IconMap = {
  // Casino & Games
  casino: 'casino',
  dice: 'dices',
  slots: 'cherry',
  roulette: 'circle-dot',
  cards: 'spade',
  chips: 'coins',

  // Actions & Stats
  energy: 'zap',
  health: 'heart-pulse',
  mood: 'smile',
  stability: 'shield',
  adequacy: 'brain',
  withdrawal: 'droplet',
  hunger: 'utensils',

  // Items & Objects
  pills: 'pill',
  phone: 'smartphone',
  money: 'banknote',
  microphone: 'mic-2',
  headphones: 'headphones',

  // Status & UI
  fire: 'flame',
  skull: 'skull',
  target: 'target',
  chart: 'trending-up',
  trophy: 'trophy',
  lock: 'lock',
  unlock: 'unlock',

  // Time & Calendar
  clock: 'clock',
  moon: 'moon',
  sun: 'sun',

  // Social & Relations
  user: 'user',
  users: 'users',
  message: 'message-circle',

  // Misc
  theater: 'theater',
  music: 'music',
  home: 'home',
  map: 'map',
  shield_check: 'shield-check',
  alert: 'alert-triangle'
};

/**
 * Generates an icon HTML element
 * @param {string} iconName - Name from IconMap
 * @param {Object} options - Additional options
 * @returns {string} HTML string for icon
 */
export function icon(iconName, options = {}) {
  const {
    size = 16,
    className = '',
    color = 'currentColor',
    strokeWidth = 2
  } = options;

  const iconKey = IconMap[iconName] || iconName;

  return `<i data-lucide="${iconKey}" class="icon ${className}" style="width: ${size}px; height: ${size}px; color: ${color}; stroke-width: ${strokeWidth}"></i>`;
}

/**
 * Creates a text label with icon
 * @param {string} iconName - Icon name
 * @param {string} text - Label text
 * @param {Object} options - Icon options
 * @returns {string} HTML string
 */
export function iconLabel(iconName, text, options = {}) {
  return `
    <span class="icon-label">
      ${icon(iconName, options)}
      <span class="icon-label-text">${text}</span>
    </span>
  `;
}

/**
 * Initialize Lucide icons after DOM is loaded
 * Call this after rendering icons
 */
export function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Export for use in modules
export default {
  icon,
  iconLabel,
  initIcons,
  IconMap
};

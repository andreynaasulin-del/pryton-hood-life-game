/**
 * UTILS - Shared utilities
 * Переиспользуемые функции для всего проекта
 */

export class Utils {
    /**
     * Format number with K/M suffix
     */
    static formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num);
    }

    /**
     * Safe localStorage get with fallback
     */
    static getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`[Storage] Error reading ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Safe localStorage set with error handling
     */
    static saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`[Storage] Error saving ${key}:`, error);
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('[Storage] Quota exceeded! Clearing old data...');
                // Could implement cleanup logic here
            }
            return false;
        }
    }

    /**
     * Clamp value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Random integer between min and max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Random element from array
     */
    static randomElement(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function - limits execution to once per interval
     * Unlike debounce, ensures function runs at most once per `limit` ms
     */
    static throttle(func, limit) {
        let inThrottle = false;
        let lastArgs = null;

        return function throttled(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                    if (lastArgs) {
                        func.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, limit);
            } else {
                lastArgs = args;
            }
        };
    }

    /**
     * Deep clone object
     */
    static deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('[Utils] Deep clone error:', error);
            return obj;
        }
    }

    /**
     * Get time ago string
     */
    static getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'только что';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
        return `${Math.floor(seconds / 86400)} дн назад`;
    }

    /**
     * Safe DOM query with error handling
     */
    static safeQuery(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.error(`[Utils] Query error for ${selector}:`, error);
            return null;
        }
    }

    /**
     * Safe DOM query all with error handling
     */
    static safeQueryAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.error(`[Utils] QueryAll error for ${selector}:`, error);
            return [];
        }
    }
}

/**
 * LOGGER - Centralized logging system
 * Контролирует все логи в игре
 */

class Logger {
    constructor() {
        this.enabled = import.meta.env?.DEV || false;
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        this.currentLevel = this.enabled ? this.levels.DEBUG : this.levels.ERROR;
    }

    debug(...args) {
        if (this.enabled && this.currentLevel <= this.levels.DEBUG) {
        }
    }

    info(...args) {
        if (this.enabled && this.currentLevel <= this.levels.INFO) {
        }
    }

    warn(...args) {
        if (this.currentLevel <= this.levels.WARN) {
            console.warn('[WARN]', ...args);
        }
    }

    error(...args) {
        if (this.currentLevel <= this.levels.ERROR) {
            console.error('[ERROR]', ...args);
        }
    }

    group(label) {
        if (this.enabled) {
            console.group(label);
        }
    }

    groupEnd() {
        if (this.enabled) {
            console.groupEnd();
        }
    }

    table(data) {
        if (this.enabled) {
            console.table(data);
        }
    }

    time(label) {
        if (this.enabled) {
            console.time(label);
        }
    }

    timeEnd(label) {
        if (this.enabled) {
            console.timeEnd(label);
        }
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

// Export singleton
export const logger = new Logger();

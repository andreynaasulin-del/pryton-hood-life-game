/**
 * TICK MANAGER - Единое сердце игры
 * Оптимизирует производительность, заменяя десятки setInterval одним циклом.
 */
class TickManager {
    constructor() {
        this.subscribers = new Set();
        this.intervalId = null;
        this.tickRate = 1000; // 1 секунда
    }

    start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.tick(), this.tickRate);
        console.log('[TickManager] Сердце забилось (1Hz)');
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
    }

    unsubscribe(callback) {
        this.subscribers.delete(callback);
    }

    tick() {
        const timestamp = Date.now();

        // Update Prison Time & Game State
        if (window.gameState) {
            window.gameState.jailTick();
            if (window.gameState.farmTick) window.gameState.farmTick();
            // Optional: Auto-advance game time 1 min per real sec for "vibe"
            // window.gameState.advanceTime(1); 
        }

        this.subscribers.forEach(callback => {
            try {
                callback(timestamp);
            } catch (e) {
                console.error('[TickManager] Ошибка в подписчике:', e);
            }
        });
    }
}

export const tickManager = new TickManager();

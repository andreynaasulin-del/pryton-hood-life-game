/**
 * EVENT DELEGATOR - Централизованная обработка событий
 * 
 * Заменяет множественные element.onclick на один document listener.
 * Работает с динамически создаваемым контентом без перепривязки.
 * 
 * @example
 * eventDelegator.on('click', '.buy-btn', (e, target) => {
 *   const itemId = target.dataset.id;
 *   shopSystem.buy(itemId);
 * });
 */

class EventDelegator {
    constructor() {
        this.handlers = {
            click: new Map(),
            change: new Map(),
            input: new Map(),
            submit: new Map()
        };
        this.initialized = false;
    }

    /**
     * Initialize the delegator - call once on app start
     */
    init() {
        if (this.initialized) return;

        // Bind core event types
        Object.keys(this.handlers).forEach(eventType => {
            document.addEventListener(eventType, (e) => this._handleEvent(eventType, e), {
                passive: eventType !== 'submit',
                capture: false
            });
        });

        this.initialized = true;
        console.log('[EventDelegator] Initialized with delegated event handling');
    }

    /**
     * Register a delegated event handler
     * @param {string} eventType - 'click', 'change', 'input', 'submit'
     * @param {string} selector - CSS selector to match
     * @param {Function} callback - (event, matchedElement) => void
     * @param {Object} options - { stopPropagation: false, preventDefault: false }
     * @returns {Function} Unsubscribe function
     */
    on(eventType, selector, callback, options = {}) {
        if (!this.handlers[eventType]) {
            console.warn(`[EventDelegator] Unknown event type: ${eventType}`);
            return () => { };
        }

        const handler = { callback, options };
        this.handlers[eventType].set(selector, handler);

        // Return unsubscribe function
        return () => this.off(eventType, selector);
    }

    /**
     * Remove a delegated event handler
     * @param {string} eventType 
     * @param {string} selector 
     */
    off(eventType, selector) {
        if (this.handlers[eventType]) {
            this.handlers[eventType].delete(selector);
        }
    }

    /**
     * Clear all handlers for an event type (useful for cleanup)
     * @param {string} eventType - Optional, clears all if omitted
     */
    clear(eventType = null) {
        if (eventType && this.handlers[eventType]) {
            this.handlers[eventType].clear();
        } else {
            Object.values(this.handlers).forEach(map => map.clear());
        }
    }

    /**
     * Internal event handler
     * @private
     */
    _handleEvent(eventType, event) {
        const handlers = this.handlers[eventType];
        if (!handlers || handlers.size === 0) return;

        // Check each registered selector
        for (const [selector, { callback, options }] of handlers) {
            const target = event.target.closest(selector);
            if (target) {
                try {
                    if (options.preventDefault) event.preventDefault();
                    if (options.stopPropagation) event.stopPropagation();

                    callback(event, target);
                } catch (error) {
                    console.error(`[EventDelegator] Handler error for "${selector}":`, error);
                }

                // Only match first handler (can be changed if needed)
                break;
            }
        }
    }

    /**
     * Utility: Register click handler (shorthand)
     * @param {string} selector 
     * @param {Function} callback 
     */
    click(selector, callback, options = {}) {
        return this.on('click', selector, callback, options);
    }

    /**
     * Utility: Register form submit handler
     * @param {string} selector 
     * @param {Function} callback 
     */
    submit(selector, callback) {
        return this.on('submit', selector, callback, { preventDefault: true });
    }
}

export const eventDelegator = new EventDelegator();
export default eventDelegator;

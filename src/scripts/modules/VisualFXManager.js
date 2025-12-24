import { gameState } from './game-state.js';
import { logger } from './logger.js';

/**
 * VISUAL FX MANAGER - Neuro-Horror Interface Controller
 * Manages Diegetic UI states: Glitch, Trip, and Stability effects.
 */
class VisualFXManager {
    constructor() {
        this.body = document.body;
        this.isGlitching = false;
        this.flickerInterval = null;

        // Intensity thresholds
        this.THRESHOLDS = {
            GLITCH: 30, // Stability below this triggers glitches
            CRITICAL: 10, // Stability below this triggers heavy artifacts
            TRIP_SOFT: 30, // Trip above this triggers colors
            TRIP_HARD: 70  // Trip above this triggers hallucinations
        };
    }

    init() {
        logger.info('[VisualFX] Инициализация нейронных фильтров...');

        // Subscribe to state changes for automatic FX updates
        gameState.subscribe('change', (data) => this.handleStateChange(data));

        // Initial setup
        this.updateGlobalClasses(gameState.getState());
        this.createOverlays();
    }

    createOverlays() {
        // Create permanent noise layer if not exists
        if (!document.querySelector('.pn-noise-layer')) {
            const noise = document.createElement('div');
            noise.className = 'pn-noise-layer';
            document.body.appendChild(noise);
        }

        // Scanlines are handled in CSS via .ds-scanlines on containers
    }

    handleStateChange(data) {
        const state = gameState.getState();
        this.updateGlobalClasses(state);

        // Specific triggers if needed
        if (data.name === 'stability' && data.value < this.THRESHOLDS.GLITCH) {
            this.triggerScreenShake(data.value < this.THRESHOLDS.CRITICAL ? 'heavy' : 'light');
        }
    }

    updateGlobalClasses(state) {
        const stability = state.stats?.stability || 100;
        const trip = state.stats?.trip || 0;
        const sync = state.stats?.synchronization || 100;

        // Reset classes
        this.body.classList.remove('ui-state-glitch', 'ui-state-critical', 'ui-state-trip-soft', 'ui-state-trip-hard');

        // Apply Glitch States
        if (stability < this.THRESHOLDS.GLITCH) {
            this.body.classList.add('ui-state-glitch');
            if (stability < this.THRESHOLDS.CRITICAL) {
                this.body.classList.add('ui-state-critical');
            }
        }

        // Apply Trip States
        if (trip > this.THRESHOLDS.TRIP_SOFT) {
            this.body.classList.add('ui-state-trip-soft');
            if (trip > this.THRESHOLDS.TRIP_HARD) {
                this.body.classList.add('ui-state-trip-hard');
            }
        }

        // Update Sync Variable for CSS
        document.documentElement.style.setProperty('--system-sync', `${sync}%`);
    }

    triggerScreenShake(intensity = 'light') {
        if (this.isGlitching) return;

        const className = intensity === 'heavy' ? 'fx-shake-heavy' : 'fx-shake-light';
        this.body.classList.add(className);
        this.isGlitching = true;

        setTimeout(() => {
            this.body.classList.remove(className);
            this.isGlitching = false;
        }, 500);
    }

    /**
     * Text Glitcher - Randomly corrupts text elements
     */
    glitchText(element, originalText) {
        const chars = 'ABCDEFGHIKLMNOPQRSTUVWXYZ0123456789§$@#%&';
        let iterations = 0;

        const interval = setInterval(() => {
            element.innerText = originalText.split('')
                .map((char, index) => {
                    if (index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');

            if (iterations >= originalText.length) clearInterval(interval);
            iterations += 1 / 3;
        }, 30);
    }
}

export const visualFXManager = new VisualFXManager();
window.visualFX = visualFXManager;

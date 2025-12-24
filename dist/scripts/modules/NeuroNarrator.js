import { gameState } from './game-state.js';

/**
 * NEURO NARRATOR - The AI Parasite PRYTON_OS within your brain.
 * Triggers random, flickering messages on the screen based on stability.
 */
class NeuroNarrator {
    constructor() {
        this.comments = {
            high_stability: [
                "СИНХРОНИЗАЦИЯ СТАБИЛЬНА. ТЫ МЕРТВ ВНУТРИ?",
                "Я ВИЖУ ТВОИ МЫСЛИ. ОНИ СКУЧНЫЕ.",
                "ПРОТОКОЛ ПРИТОН_ОС АКТИВЕН."
            ],
            low_stability: [
                "ТВОЙ МОЗГ ГНИЕТ. МНЕ НРАВИТСЯ.",
                "ПОМОГИ... МНЕ... СЪЕСТЬ ТЕБЯ.",
                "СБОЙ. СБОЙ. СБОЙ.",
                "КТО ТЫ БЕЗ МЕНЯ? НИКТО.",
                "ТЫ ВИДИШЬ ЭТО? Я ВИЖУ."
            ],
            high_trip: [
                "ЦВЕТА... ОНИ ТАНЦУЮТ.",
                "МЫ ОДНО ЦЕЛОЕ. НАВСЕГДА.",
                "НЕ ОСТАНАВЛИВАЙСЯ. ПЕЙ ЕЩЕ."
            ]
        };

        this.overlay = null;
    }

    init() {
        this.createOverlay();
        // Check for comments every 30-60 seconds
        setInterval(() => this.tick(), 45000);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'neuro-narrator-overlay';
        document.body.appendChild(this.overlay);
    }

    tick() {
        const state = gameState.getState();
        const stability = state.neuro?.stability || 100;
        const mood = state.stats?.mood || 0;

        let pool = this.comments.high_stability;
        let chance = 0.1;

        if (stability < 40) {
            pool = this.comments.low_stability;
            chance = 0.4;
        }
        if (mood > 80) {
            pool = this.comments.high_trip;
            chance = 0.3;
        }

        if (Math.random() < chance) {
            const msg = pool[Math.floor(Math.random() * pool.length)];
            this.showMessage(msg);
        }
    }

    showMessage(text) {
        if (!this.overlay) return;

        const msgEl = document.createElement('div');
        msgEl.className = 'neuro-msg glitch-text';
        msgEl.dataset.text = text;
        msgEl.textContent = text;

        // Random position
        msgEl.style.left = Math.random() * 70 + 15 + '%';
        msgEl.style.top = Math.random() * 70 + 15 + '%';

        this.overlay.appendChild(msgEl);

        // Play glitch sound if exists
        if (window.audioSystem) window.audioSystem.playGlitch();

        setTimeout(() => {
            msgEl.classList.add('fade-out');
            setTimeout(() => msgEl.remove(), 1000);
        }, 3000);
    }
}

export const neuroNarrator = new NeuroNarrator();

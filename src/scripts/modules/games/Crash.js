import { gameState } from '../game-state.js';

const CrashGame = {
    multiplier: 1.00,
    isRunning: false,
    isCashedOut: false,
    crashPoint: 0,
    bet: 100,
    rafId: null,
    startTime: 0,
    el: {},
    initialized: false,
    uiManager: null,

    init(manager) {
        if (this.initialized) return;
        console.log('[Crash] Initializing...');
        this.uiManager = manager;
        this.initialized = true;

        const multiplier = document.getElementById('crashMultiplier');
        const btn = document.getElementById('crashActionBtn');

        if (!multiplier || !btn) {
            console.warn('[Crash] Missing DOM elements, skipping full init');
            return;
        }

        this.el = {
            multiplier: multiplier,
            status: document.getElementById('crashStatus'),
            btn: btn,
            input: document.getElementById('crashBetInput'),
            lines: document.querySelector('.crash-grid-lines'),
            ghostBtn: document.getElementById('ghostLuckCrashBtn')
        };

        // Быстрые ставки
        document.querySelectorAll('.quick-bet').forEach(btn => {
            btn.onclick = () => {
                if (this.isRunning) return;
                this.bet = parseInt(btn.dataset.val);
                if (this.el.input) this.el.input.value = this.bet;
            };
        });

        // ГЛАВНАЯ КНОПКА
        if (this.el.btn) {
            this.el.btn.onclick = () => this.handleMainButton();
        }

        // Action buttons via bindSafeClick
        if (this.uiManager) {
            this.uiManager.bindSafeClick('backToLobbyBtnCrash', () => this.uiManager.backToLobby());
            this.uiManager.bindSafeClick('ghostLuckCrashBtn', () => this.startGame(true));
        }

        this.updateUI();
    },

    open() {
        // Re-attempt init if it failed due to missing DOM
        if (!this.initialized) {
            this.init(this.uiManager || window.uiManager);
        }

        // Update chips display
        const chipsEl = document.getElementById('crashChips');
        if (chipsEl) {
            chipsEl.textContent = gameState.getState().casino?.chips || 0;
        }

        this.updateUI();

        // Render Lucide icons
        if (window.lucide) window.lucide.createIcons();
    },

    handleMainButton() {
        if (this.isRunning) {
            this.cashOut();
        } else {
            this.startGame(false);
        }
    },

    updateUI() {
        this.resetBtnState();
    },

    startGame(isGhost = false) {
        if (this.isRunning) return;

        this.bet = parseInt(this.el.input.value);
        const casino = gameState.getState().casino;

        if (isNaN(this.bet) || this.bet <= 0) {
            gameState.addLogEntry("Неверная ставка!", "spirit");
            return;
        }
        if (casino.chips < this.bet) {
            gameState.addLogEntry("Не хватает фишек!", "spirit");
            return;
        }

        if (isGhost) {
            if (gameState.stats.health < 10) {
                gameState.addLogEntry("Мало здоровья!", "spirit");
                return;
            }
            gameState.updateStat('health', -10);
            gameState.addLogEntry("Дух держит график...", "spirit");
            document.querySelector('.crash-monitor')?.classList.add('ghost-distortion');
        }

        casino.chips -= this.bet;
        if (this.uiManager) this.uiManager.renderCasinoStatus();

        this.isRunning = true;
        this.isCashedOut = false;
        this.multiplier = 1.00;
        this.startTime = Date.now();

        this.el.btn.textContent = "ЗАБРАТЬ";
        this.el.btn.classList.add('cashout-mode');
        this.el.status.textContent = "🚀 ПОЛЕТ...";
        this.el.status.classList.remove('text-crash-win', 'text-crash-loss');
        this.el.status.classList.add('text-crash-flying');
        this.el.multiplier.classList.remove('crashed', 'win-animation', 'text-crash-win');

        if (this.el.lines) this.el.lines.style.animation = "gridScroll 0.5s linear infinite";

        this.crashPoint = this.generateCrashPoint(isGhost);
        this.loop();
    },

    loop() {
        if (!this.isRunning) return;

        const elapsed = (Date.now() - this.startTime) / 1000;
        this.multiplier = 1 + (Math.pow(Math.E, elapsed * 0.15) - 1) * 8;

        this.el.multiplier.textContent = this.multiplier.toFixed(2) + "x";

        const currentWin = Math.floor(this.bet * this.multiplier);
        this.el.btn.innerHTML = `ЗАБРАТЬ <span class="crash-win-amount">(+${currentWin})</span>`;

        if (this.multiplier >= this.crashPoint) {
            this.crash();
        } else {
            this.rafId = requestAnimationFrame(() => this.loop());
        }
    },

    cashOut() {
        if (!this.isRunning || this.isCashedOut) return;

        this.isRunning = false;
        this.isCashedOut = true;
        cancelAnimationFrame(this.rafId);

        const win = Math.floor(this.bet * this.multiplier);
        const casino = gameState.getState().casino;
        casino.chips += win;
        if (this.uiManager) this.uiManager.renderCasinoStatus();

        this.el.status.textContent = `ВЫИГРЫШ: +${win - this.bet}`;
        this.el.status.classList.remove('text-crash-flying');
        this.el.status.classList.add('text-crash-win');
        this.el.multiplier.classList.add('win-animation', 'text-crash-win');

        gameState.addLogEntry(`Крэш: забрал на ${this.multiplier.toFixed(2)}x (+${win - this.bet})`, "good");

        this.resetBtnState();
    },

    crash() {
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);

        this.el.multiplier.textContent = this.crashPoint.toFixed(2) + "x";
        this.el.multiplier.classList.add('crashed');
        this.el.status.textContent = "💥 ОБВАЛ!";
        this.el.status.classList.remove('text-crash-flying');
        this.el.status.classList.add('text-crash-loss');

        if (this.el.lines) this.el.lines.style.animation = "none";
        document.querySelector('.crash-monitor')?.classList.remove('ghost-distortion');

        gameState.addLogEntry(`Крэш: обвал на ${this.crashPoint.toFixed(2)}x`, "neutral");
        this.resetBtnState();
    },

    resetBtnState() {
        this.el.btn.innerHTML = "СТАРТ";
        this.el.btn.classList.remove('cashout-mode');
        if (this.el.lines) this.el.lines.style.animation = "none";
    },

    generateCrashPoint(isGhost) {
        if (isGhost) return (Math.random() * 3 + 2.05);
        const r = Math.random();
        if (r < 0.03) return 1.00;
        return 1 / (1 - r) * 0.95;
    }
};

export default CrashGame;

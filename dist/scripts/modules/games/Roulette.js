import { gameState } from '../game-state.js';
import { CASINO_PROGRESSION } from '../../data/constants.js';

const RouletteGame = {
    currentBet: 1000,
    currentBets: [],
    initialized: false,
    uiManager: null,

    // European Roulette constants
    redNumbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    blackNumbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],

    init(uiManager) {
        if (this.initialized) return;
        console.log('[Roulette] Initializing...');
        this.uiManager = uiManager;
        this.initialized = true;

        this.createRouletteWheel();

        if (this.uiManager) {
            this.uiManager.bindSafeClick('backToLobbyBtnRoulette', () => this.uiManager.backToLobby());
            this.uiManager.bindSafeClick('clearBetsBtn', () => this.clearBets());
            this.uiManager.bindSafeClick('spinWheelBtn', () => this.spinWheel());
            this.uiManager.bindSafeClick('ghostLuckRouletteBtn', () => this.spinWheel(true));
        }

        // Color bets
        document.querySelectorAll('.bet-option.color-bet').forEach(btn => {
            btn.onclick = () => this.addBet('color', btn.dataset.value);
        });

        // Parity bets
        document.querySelectorAll('.bet-option.parity-bet').forEach(btn => {
            btn.onclick = () => this.addBet('parity', btn.dataset.value);
        });

        // Number bet input
        const numberInput = document.getElementById('numberBetInput');
        if (numberInput) {
            numberInput.onchange = (e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 36) {
                    this.addBet('number', val);
                    e.target.value = '';
                }
            };
        }

        // Bet amount buttons
        document.querySelectorAll('.roulette-game .bet-btn').forEach(btn => {
            btn.onclick = () => {
                const bet = parseInt(btn.dataset.bet);
                this.setBet(bet);
                document.querySelectorAll('.roulette-game .bet-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });

        this.updateUI();
    },

    createRouletteWheel() {
        const wheelOrder = [
            0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
            5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
        ];

        const wheelElement = document.getElementById('rouletteWheel');
        if (!wheelElement) return;
        wheelElement.innerHTML = '';

        const segmentAngle = 360 / wheelOrder.length;
        wheelOrder.forEach((number, index) => {
            const segment = document.createElement('div');
            segment.className = 'wheel-segment';
            const isRed = this.redNumbers.includes(number);
            const color = number === 0 ? 'green' : (isRed ? 'red' : 'black');
            segment.classList.add(`segment-${color}`);
            segment.style.transform = `rotate(${index * segmentAngle}deg)`;

            const numberLabel = document.createElement('div');
            numberLabel.className = 'segment-number';
            numberLabel.textContent = number;
            segment.appendChild(numberLabel);
            wheelElement.appendChild(segment);
        });

        const center = document.createElement('div');
        center.className = 'wheel-center';
        center.innerHTML = '🎯';
        wheelElement.appendChild(center);

        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.id = 'rouletteBall';
        wheelElement.appendChild(ball);
    },

    setBet(bet) {
        if (isNaN(bet) || bet <= 0) return;
        this.currentBet = bet;
        this.updateUI();
    },

    addBet(type, value) {
        const betAmount = this.currentBet || 1000;
        const existingBet = this.currentBets.find(bet => bet.type === type && bet.value === value);
        if (existingBet) existingBet.amount += betAmount;
        else this.currentBets.push({ type, value, amount: betAmount });
        this.updateUI();
    },

    clearBets() {
        this.currentBets = [];
        this.updateUI();
    },

    updateUI() {
        const casino = gameState.getState().casino;
        const spinBtn = document.getElementById('spinWheelBtn');
        const totalBet = this.currentBets.reduce((sum, b) => sum + b.amount, 0);

        const totalBetEl = document.getElementById('rouletteTotalBet');
        if (totalBetEl) totalBetEl.textContent = totalBet;

        const currentBetEl = document.getElementById('rouletteCurrentBet');
        if (currentBetEl) currentBetEl.textContent = this.currentBet;

        if (spinBtn) {
            spinBtn.disabled = casino.chips < totalBet || totalBet === 0;
            spinBtn.textContent = casino.chips < totalBet ? `НЕТ ФИШЕК (${totalBet})` : (totalBet === 0 ? 'СТАВЬ!' : `КРУТИТЬ (${totalBet})`);
        }
    },

    spinWheel(isGhostActive = false) {
        const casino = gameState.getState().casino;
        const totalBet = this.currentBets.reduce((sum, b) => sum + b.amount, 0);

        if (isGhostActive && gameState.stats.health < 10) return;
        if (casino.chips < totalBet || totalBet === 0) return;

        const spinBtn = document.getElementById('spinWheelBtn');
        if (spinBtn) spinBtn.disabled = true;

        if (isGhostActive) {
            gameState.updateStat('health', -10);
            gameState.addLogEntry('Дух останавливает колесо...', 'spirit');
        }

        casino.chips -= totalBet;
        const winningNumber = Math.floor(Math.random() * 37);

        const wheel = document.getElementById('rouletteWheel');
        if (wheel) wheel.style.transform = `rotate(${360 * 5 + (winningNumber * (360 / 37))}deg)`;

        setTimeout(() => {
            const result = this.calculateWinnings(winningNumber);
            casino.chips += result.totalWinnings;

            if (this.uiManager?.casinoProgression) {
                this.uiManager.casinoProgression.addXP(10);
            }

            this.showResult(result, winningNumber);
            this.clearBets();
            if (spinBtn) spinBtn.disabled = false;
        }, 4000);
    },

    calculateWinnings(winningNumber) {
        let totalWinnings = 0;
        this.currentBets.forEach(bet => {
            let win = false;
            let mult = 0;
            if (bet.type === 'color') {
                if (winningNumber !== 0) {
                    const isRed = this.redNumbers.includes(winningNumber);
                    win = (bet.value === 'red' && isRed) || (bet.value === 'black' && !isRed);
                }
                mult = 2;
            } else if (bet.type === 'parity') {
                if (winningNumber !== 0) {
                    const isEven = winningNumber % 2 === 0;
                    win = (bet.value === 'even' && isEven) || (bet.value === 'odd' && !isEven);
                }
                mult = 2;
            } else if (bet.type === 'number') {
                win = parseInt(bet.value) === winningNumber;
                mult = 36;
            }
            if (win) totalWinnings += bet.amount * mult;
        });
        return { totalWinnings };
    },

    showResult(result, winningNumber) {
        const isRed = this.redNumbers.includes(winningNumber);
        const name = winningNumber === 0 ? 'GREEN' : (isRed ? 'RED' : 'BLACK');
        gameState.addLogEntry(`Рулетка: Выпало ${winningNumber} (${name}). ${result.totalWinnings > 0 ? 'Выигрыш: ' + result.totalWinnings : 'Проигрыш.'}`, result.totalWinnings > 0 ? 'good' : 'neutral');
        if (this.uiManager) this.uiManager.renderCasinoStatus();
    },

    open() {
        // Re-attempt init if it failed due to missing DOM
        if (!this.initialized) {
            this.init(this.uiManager || window.uiManager);
        }
        const lobby = document.getElementById('casinoLobby');
        const game = document.getElementById('rouletteGame');
        if (lobby && game) {
            lobby.style.display = 'none';
            game.style.display = 'flex';
        }

        // Update chips display
        const chipsEl = document.getElementById('rouletteChips');
        if (chipsEl) {
            chipsEl.textContent = gameState.getState().casino?.chips || 0;
        }

        this.updateUI();

        // Render Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }
};

export default RouletteGame;

import { gameState } from '../game-state.js';
import { CASINO_PROGRESSION } from '../../data/constants.js';

const DiceGame = {
    currentBet: 100,
    currentOutcome: null,
    uiManager: null,

    init(uiManager) {
        console.log('[Dice] Initializing...');
        if (this.initialized) return;

        const controls = document.querySelector('.dice-controls');
        const betOptions = document.querySelector('.dice-bet-options');

        if (!controls && !betOptions) {
            console.warn('[Dice] Missing DOM elements, skipping full init');
            return;
        }

        this.initialized = true;
        this.uiManager = uiManager;

        // Action buttons
        if (this.uiManager) {
            this.uiManager.bindSafeClick('backToLobbyBtnDice', () => this.uiManager.backToLobby());
            this.uiManager.bindSafeClick('rollBtn', () => this.rollDice());
            this.uiManager.bindSafeClick('ghostLuckDiceBtn', () => this.rollDice(true));
        }

        // Event Delegation for Bet Buttons
        if (controls) {
            controls.addEventListener('click', (e) => {
                const btn = e.target.closest('.bet-btn');
                if (btn) {
                    const bet = parseInt(btn.dataset.bet);
                    this.setBet(bet);
                    document.querySelectorAll('.dice-controls .bet-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        }

        // Event Delegation for Outcome Buttons
        if (betOptions) {
            betOptions.addEventListener('click', (e) => {
                const btn = e.target.closest('.dice-bet-btn');
                if (btn) {
                    const outcome = btn.dataset.outcome;
                    this.setOutcome(outcome);
                    document.querySelectorAll('.dice-bet-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.updateUI();
                }
            });
        }

        this.updateUI();
    },

    setBet(bet) {
        // КРИТИЧНО: Валидация ставки
        if (isNaN(bet) || bet <= 0) {
            gameState.addLogEntry("Неверная ставка!", "spirit");
            return;
        }

        this.currentBet = bet;
        const betValue = document.getElementById('diceCurrentBet');
        const rollCost = document.getElementById('rollCost');

        if (betValue) betValue.textContent = bet;
        if (rollCost) rollCost.textContent = `${bet} фишек`;

        this.updateUI();
    },

    setOutcome(outcome) {
        this.currentOutcome = outcome;
    },

    async rollDice(isGhostActive = false) {
        const casino = gameState.getState().casino;
        const bet = this.currentBet || 100;
        const outcome = this.currentOutcome;

        // Check if player has enough chips and selected outcome
        if (casino.chips < bet) {
            gameState.addLogEntry('Недостаточно фишек для ставки!', 'spirit');
            return;
        }

        if (!outcome) {
            gameState.addLogEntry('Выберите исход ставки!', 'spirit');
            return;
        }

        // Check if ghost luck is available
        if (isGhostActive) {
            const state = gameState.getState();
            const hasEnoughResources = state.stats.health >= 10 || state.stats.energy >= 10;
            if (!hasEnoughResources) {
                gameState.addLogEntry('Недостаточно здоровья или энергии для призрачной удачи!', 'spirit');
                return;
            }

            // Track ghost luck activation
            if (this.uiManager) {
                this.uiManager.lastGhostLuckActivation = Date.now();
                this.uiManager.lastGhostLuckGame = 'dice';
            }
        }

        // Disable roll button
        const rollBtn = document.getElementById('rollBtn');
        if (rollBtn) {
            rollBtn.disabled = true;
            rollBtn.textContent = 'БРОСАЕМ...';
        }

        const resultDisplay = document.getElementById('diceResultDisplay');
        if (resultDisplay) {
            resultDisplay.classList.remove('show', 'win', 'lose');
            resultDisplay.textContent = '';
        }

        // Deduct bet
        casino.chips -= bet;
        casino.dailySpent += bet;

        // Apply ghost luck cost
        if (isGhostActive) {
            const state = gameState.getState();
            if (state.stats.health >= 10) {
                gameState.updateStat('health', -10);
            } else {
                gameState.updateStat('energy', -10);
            }

            // Increase suspicion
            casino.suspicionLevel += 20;

            // Track ghost luck activation
            if (this.uiManager) {
                this.uiManager.lastGhostLuckActivation = Date.now();
                this.uiManager.lastGhostLuckGame = 'dice';
                this.uiManager.applyGhostLuckEffect();
            }

            // Log ghost luck usage
            gameState.addLogEntry('ДУХ шепчет: "Призрак помогает..."', 'spirit');
        }

        // Start shake animation
        const dice = document.querySelectorAll('.dice-game .die');
        dice.forEach(die => {
            die.classList.add('shaking');
        });

        // Generate random dice values
        let die1Value = Math.floor(Math.random() * 6) + 1;
        let die2Value = Math.floor(Math.random() * 6) + 1;
        let total = die1Value + die2Value;

        // Apply ghost luck logic if losing
        if (isGhostActive) {
            const wouldWin = this.checkWin(total, outcome, bet).win;
            if (!wouldWin) {
                // Force a winning result based on outcome
                if (outcome === 'low') {
                    // Force total < 7
                    die1Value = Math.floor(Math.random() * 3) + 1;
                    die2Value = Math.floor(Math.random() * 3) + 1;
                    total = die1Value + die2Value;
                    while (total >= 7) { die1Value = Math.max(1, die1Value - 1); total = die1Value + die2Value; }
                } else if (outcome === 'exact') {
                    die1Value = 3; die2Value = 4; total = 7;
                } else if (outcome === 'high') {
                    die1Value = Math.floor(Math.random() * 3) + 4;
                    die2Value = Math.floor(Math.random() * 3) + 4;
                    total = die1Value + die2Value;
                    while (total <= 7) { die1Value = Math.min(6, die1Value + 1); total = die1Value + die2Value; }
                }
            }
        }

        // Wait for animation, then show results
        setTimeout(() => {
            // Stop shaking
            const diceArea = document.querySelector('.dice-area');
            if (diceArea) diceArea.classList.remove('shaking');

            const d1 = document.getElementById('dice1');
            const d2 = document.getElementById('dice2');
            if (d1) d1.textContent = die1Value;
            if (d2) d2.textContent = die2Value;

            // Check win and update UI
            const result = this.checkWin(total, outcome, bet);
            this.showResult(result, isGhostActive);
            this.updateUI();

            // Add XP for playing
            if (this.uiManager && this.uiManager.casinoProgression) {
                this.uiManager.casinoProgression.addXP(10);
            }
        }, 1000);

        // Re-enable roll button
        setTimeout(() => {
            if (rollBtn) {
                rollBtn.disabled = false;
                rollBtn.innerHTML = `
          <span class="roll-text">БРОСИТЬ КОСТИ</span>
          <span class="roll-cost">${bet} фишек</span>
        `;
            }
        }, 1500);
    },

    showValues(dieId, value) {
        const die = document.getElementById(dieId);
        if (!die) {
            return;
        }

        // Map value to face class
        const faceMap = {
            1: 'front',
            2: 'back',
            3: 'right',
            4: 'left',
            5: 'top',
            6: 'bottom'
        };

        const face = faceMap[value] || 'front';

        // Remove existing show-* classes
        die.classList.remove('show-front', 'show-back', 'show-right', 'show-left', 'show-top', 'show-bottom');

        // Add new class to rotate the die
        void die.offsetWidth; // Trigger reflow
        die.classList.add(`show-${face}`);
    },

    checkWin(total, outcome, bet) {
        let win = false;
        let winnings = 0;
        let multiplier = 0;

        if (outcome === 'low' && total < 7) {
            win = true;
            multiplier = 2.0;
        } else if (outcome === 'exact' && total === 7) {
            win = true;
            multiplier = 5.0;
        } else if (outcome === 'high' && total > 7) {
            win = true;
            multiplier = 2.0;
        }

        if (win) {
            winnings = Math.floor(bet * multiplier);
            const casino = gameState.getState().casino;
            casino.chips += winnings;
        }

        return { win, winnings, total, outcome, bet };
    },

    showResult(result, isGhostActive = false) {
        const lastWin = document.getElementById('diceLastWin');
        const resultDisplay = document.getElementById('diceResultDisplay');

        // Update main result display
        if (resultDisplay) {
            resultDisplay.classList.remove('show', 'win', 'lose');
            void resultDisplay.offsetWidth; // Trigger reflow

            if (result.winnings > 0) {
                resultDisplay.textContent = `ВЫПАЛО: ${result.total} — ПОБЕДА! (+${result.winnings})`;
                resultDisplay.classList.add('win', 'show');
            } else {
                resultDisplay.textContent = `ВЫПАЛО: ${result.total} — ПРОИГРЫШ`;
                resultDisplay.classList.add('lose', 'show');
            }
        }

        if (lastWin) {
            lastWin.textContent = result.winnings;
            if (result.winnings > 0) {
                lastWin.classList.add('win-animation');
                // Special color for ghost luck wins
                if (isGhostActive) {
                    lastWin.classList.add('text-ghost'); // Poisonous green
                    lastWin.textContent += ' (Призрак помог)';
                }
                setTimeout(() => {
                    lastWin.classList.remove('win-animation');
                    if (isGhostActive) {
                        lastWin.classList.remove('text-ghost');
                    }
                }, 600);
            }
        }

        // Update casino last result
        const casino = gameState.getState().casino;
        if (result.winnings > 0) {
            casino.lastResult = `🎲 +${result.winnings}`;
        } else {
            casino.lastResult = `🎲 -${result.bet}`;
        }

        // Log result
        if (result.winnings > 0) {
            const winMessage = isGhostActive
                ? `Кости: выиграл ${result.winnings} фишек! (Призрак помог)`
                : `Кости: выиграл ${result.winnings} фишек!`;
            gameState.addLogEntry(winMessage, 'good');
            if (this.uiManager && this.uiManager.spiritSystem) {
                this.uiManager.spiritSystem.maybeCommentAfterAction({ id: 'casino_bones' }, result, gameState.getState());
            }
        } else {
            gameState.addLogEntry(`Кости: проигрыш ${result.bet} фишек.`, 'neutral');
            if (this.uiManager && this.uiManager.spiritSystem) {
                this.uiManager.spiritSystem.maybeCommentAfterAction({ id: 'casino_bones' }, result, gameState.getState());
            }
        }
    },

    updateHistory(total, win) {
        const historyList = document.getElementById('diceHistory');
        if (!historyList) return;

        // Create history item
        const item = document.createElement('div');
        item.className = `history-item ${win ? 'win' : 'loss'}`;

        let color = '🔴'; // loss
        if (win) {
            color = total === 7 ? '🟢' : '🔵'; // green for 7, blue for others
        }

        item.textContent = `${color} ${total}`;

        // Add to beginning of list
        historyList.insertBefore(item, historyList.firstChild);

        // Keep only last 5 items
        while (historyList.children.length > 5) {
            historyList.removeChild(historyList.lastChild);
        }
    },

    updateUI() {
        const casino = gameState.getState().casino;
        const diceChips = document.getElementById('diceChips');
        const rollBtn = document.getElementById('rollBtn');
        const bet = this.currentBet || 100;

        if (diceChips) {
            diceChips.textContent = casino.chips;
        }

        if (rollBtn) {
            const disabled = casino.chips < bet || !this.currentOutcome;
            rollBtn.disabled = disabled;

            if (casino.chips < bet) {
                rollBtn.innerHTML = `
          <span class="roll-text">НЕТ ФИШЕК</span>
          <span class="roll-cost">нужно ${bet}</span>
        `;
            } else if (!this.currentOutcome) {
                rollBtn.innerHTML = `
          <span class="roll-text">ВЫБЕРИТЕ ИСХОД</span>
          <span class="roll-cost">${bet} фишек</span>
        `;
            } else {
                rollBtn.innerHTML = `
          <span class="roll-text">БРОСИТЬ КОСТИ</span>
          <span class="roll-cost">${bet} фишек</span>
        `;
            }
        }
    },

    open() {
        // Re-attempt init if it failed due to missing DOM
        if (!this.initialized) {
            this.init(this.uiManager || window.uiManager);
        }

        // Update chips display
        const chipsEl = document.getElementById('diceChips');
        if (chipsEl) {
            chipsEl.textContent = gameState.getState().casino?.chips || 0;
        }

        this.updateUI();

        // Render Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }
};

export default DiceGame;

/**
 * HACKING MINI-GAME
 * Взлом банкомата - головоломка с подбором кода
 */

export class HackingGame {
    constructor() {
        this.targetCode = [];
        this.currentAttempt = [];
        this.attempts = 5;
        this.codeLength = 4;
        this.symbolPool = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        this.history = [];
    }

    init(container) {
        this.container = container;
        this.generateTarget();
        this.render();
    }

    generateTarget() {
        this.targetCode = [];
        for (let i = 0; i < this.codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * this.symbolPool.length);
            this.targetCode.push(this.symbolPool[randomIndex]);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="hacking-game">
                <div class="hack-header">
                    <div class="terminal-title">
                        <span class="blink">▶</span> СИСТЕМА ВЗЛОМА v2.1
                    </div>
                    <div class="attempts-display">
                        ПОПЫТКИ: <span id="attemptsLeft">${this.attempts}</span>/5
                    </div>
                </div>

                <div class="hack-terminal">
                    <div class="terminal-output" id="hackOutput">
                        <div class="system-msg">Инициализация...</div>
                        <div class="system-msg">Подключение к банкомату...</div>
                        <div class="system-msg success">Доступ получен!</div>
                        <div class="system-msg">Код состоит из ${this.codeLength} символов (0-9, A-F)</div>
                        <div class="hint">💡 Подбери комбинацию. ✓ = правильный символ, ≈ = есть, но не там</div>
                    </div>

                    <div class="code-input-area">
                        <div class="code-display" id="codeDisplay">
                            ${Array(this.codeLength).fill('_').map((_, i) =>
            `<div class="code-slot" data-index="${i}">_</div>`
        ).join('')}
                        </div>

                        <div class="symbol-keyboard">
                            ${this.symbolPool.map(symbol =>
            `<button class="symbol-btn" data-symbol="${symbol}">${symbol}</button>`
        ).join('')}
                        </div>

                        <div class="hack-controls">
                            <button class="hack-btn clear-btn" id="clearBtn">СБРОС</button>
                            <button class="hack-btn submit-btn" id="submitBtn">ВЗЛОМАТЬ</button>
                        </div>
                    </div>
                </div>

                <div class="hack-history" id="hackHistory"></div>
            </div>
        `;

        this.setupControls();
    }

    setupControls() {
        // Symbol buttons
        document.querySelectorAll('.symbol-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.currentAttempt.length < this.codeLength) {
                    const symbol = btn.dataset.symbol;
                    this.addSymbol(symbol);
                }
            });
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAttempt();
        });

        // Submit button
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitAttempt();
        });
    }

    addSymbol(symbol) {
        if (this.currentAttempt.length >= this.codeLength) return;

        this.currentAttempt.push(symbol);
        this.updateDisplay();
    }

    clearAttempt() {
        this.currentAttempt = [];
        this.updateDisplay();
    }

    updateDisplay() {
        const slots = document.querySelectorAll('.code-slot');
        slots.forEach((slot, i) => {
            if (this.currentAttempt[i]) {
                slot.textContent = this.currentAttempt[i];
                slot.classList.add('filled');
            } else {
                slot.textContent = '_';
                slot.classList.remove('filled');
            }
        });
    }

    submitAttempt() {
        if (this.currentAttempt.length !== this.codeLength) {
            this.log('Введите полный код!', 'error');
            return;
        }

        this.attempts--;
        document.getElementById('attemptsLeft').textContent = this.attempts;

        const feedback = this.checkAttempt();
        this.addToHistory(this.currentAttempt.slice(), feedback);

        if (feedback.correct === this.codeLength) {
            this.win();
        } else if (this.attempts <= 0) {
            this.lose();
        } else {
            this.log(`Попытка: ${feedback.correct} правильных, ${feedback.present} на месте`, 'error');
            this.currentAttempt = [];
            this.updateDisplay();
        }
    }

    checkAttempt() {
        let correct = 0;
        let present = 0;

        const targetCopy = this.targetCode.slice();
        const attemptCopy = this.currentAttempt.slice();

        // First pass: check exact matches
        for (let i = 0; i < this.codeLength; i++) {
            if (attemptCopy[i] === targetCopy[i]) {
                correct++;
                targetCopy[i] = null;
                attemptCopy[i] = null;
            }
        }

        // Second pass: check present but wrong position
        for (let i = 0; i < this.codeLength; i++) {
            if (attemptCopy[i] !== null) {
                const index = targetCopy.indexOf(attemptCopy[i]);
                if (index !== -1) {
                    present++;
                    targetCopy[index] = null;
                }
            }
        }

        return { correct, present };
    }

    addToHistory(attempt, feedback) {
        const historyDiv = document.getElementById('hackHistory');
        const entry = document.createElement('div');
        entry.className = 'history-entry';

        const codeDiv = document.createElement('div');
        codeDiv.className = 'history-code';

        attempt.forEach((symbol, i) => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'history-symbol';
            symbolDiv.textContent = symbol;

            if (symbol === this.targetCode[i]) {
                symbolDiv.classList.add('correct');
            } else if (this.targetCode.includes(symbol)) {
                symbolDiv.classList.add('present');
            } else {
                symbolDiv.classList.add('wrong');
            }

            codeDiv.appendChild(symbolDiv);
        });

        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'history-feedback';
        feedbackDiv.textContent = `✓${feedback.correct} ≈${feedback.present}`;

        entry.appendChild(codeDiv);
        entry.appendChild(feedbackDiv);
        historyDiv.insertBefore(entry, historyDiv.firstChild);
    }

    log(message, type = '') {
        const output = document.getElementById('hackOutput');
        const msg = document.createElement('div');
        msg.className = `system-msg ${type}`;
        msg.textContent = '> ' + message;
        output.appendChild(msg);
        output.scrollTop = output.scrollHeight;
    }

    win() {
        this.log('ДОСТУП ПОЛУЧЕН! Код взломан!', 'success');

        const reward = 500 + (this.attempts * 100); // Больше попыток осталось = больше награда

        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete({ success: true, reward, attempts: 5 - this.attempts });
            }
        }, 1000);
    }

    lose() {
        this.log('ВЗЛОМ ПРОВАЛЕН! Попытки исчерпаны.', 'error');
        this.log(`Правильный код был: ${this.targetCode.join('')}`, 'error');

        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete({ success: false, reward: 0, attempts: 5 });
            }
        }, 1500);
    }

    destroy() {
        // Cleanup if needed
    }
}

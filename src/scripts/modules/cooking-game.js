/**
 * COOKING MINI-GAME
 * Варка/Синтез - контроль температуры и компонентов
 */

export class CookingGame {
    constructor() {
        this.temperature = 50;
        this.targetTemp = 75;
        this.tempTolerance = 10;
        this.components = { a: 0, b: 0, c: 0 };
        this.targetComponents = { a: 30, b: 20, c: 15 };
        this.time = 30; // 30 секунд
        this.gameInterval = null;
        this.quality = 0;
        this.explosionRisk = 0; // Риск взрыва
        this.perfectStreak = 0; // Комбо идеальных действий
    }

    init(container) {
        this.container = container;
        this.render();
        this.start();
    }

    render() {
        this.container.innerHTML = `
            <div class="cooking-game">
                <div class="lab-header">
                    <div class="lab-title">
                        <span class="warning-icon">⚗️</span> ЛАБОРАТОРИЯ СИНТЕЗА
                    </div>
                    <div class="timer-display" id="cookTimer">30s</div>
                </div>

                <div class="lab-station">
                    <!-- Термометр -->
                    <div class="temp-gauge">
                        <div class="gauge-label">ТЕМПЕРАТУРА</div>
                        <div class="thermometer">
                            <div class="temp-scale">
                                <div class="danger-zone" style="top: 0; height: 15%; background: rgba(239, 68, 68, 0.2);"></div>
                                <div class="target-zone" id="targetZone"></div>
                                <div class="temp-indicator" id="tempIndicator"></div>
                                <div class="reaction-bubbles" id="reactionBubbles"></div>
                            </div>
                            <div class="temp-value" id="tempValue">50°C</div>
                            <div class="risk-warning" id="riskWarning" style="display: none;">
                                ⚠️ РИСК ВЗРЫВА!
                            </div>
                        </div>
                        <div class="temp-controls">
                            <button class="temp-btn heat-btn" id="heatBtn">🔥 +НАГРЕВ</button>
                            <button class="temp-btn cool-btn" id="coolBtn">❄️ -ОХЛАД</button>
                        </div>
                    </div>

                    <!-- Компоненты -->
                    <div class="components-panel">
                        <div class="panel-label">КОМПОНЕНТЫ</div>
                        <div class="component-item">
                            <div class="comp-info">
                                <span class="comp-name">РЕАГЕНТ A</span>
                                <div class="comp-bar">
                                    <div class="comp-fill comp-a" id="compA"></div>
                                    <div class="comp-target" style="left: 30%"></div>
                                </div>
                                <span class="comp-value" id="compAVal">0%</span>
                            </div>
                            <button class="add-btn" data-comp="a">+</button>
                        </div>

                        <div class="component-item">
                            <div class="comp-info">
                                <span class="comp-name">РЕАГЕНТ B</span>
                                <div class="comp-bar">
                                    <div class="comp-fill comp-b" id="compB"></div>
                                    <div class="comp-target" style="left: 20%"></div>
                                </div>
                                <span class="comp-value" id="compBVal">0%</span>
                            </div>
                            <button class="add-btn" data-comp="b">+</button>
                        </div>

                        <div class="component-item">
                            <div class="comp-info">
                                <span class="comp-name">РЕАГЕНТ C</span>
                                <div class="comp-bar">
                                    <div class="comp-fill comp-c" id="compC"></div>
                                    <div class="comp-target" style="left: 15%"></div>
                                </div>
                                <span class="comp-value" id="compCVal">0%</span>
                            </div>
                            <button class="add-btn" data-comp="c">+</button>
                        </div>
                    </div>
                </div>

                <div class="quality-meter">
                    <div class="quality-label">КАЧЕСТВО ПРОДУКТА</div>
                    <div class="quality-bar">
                        <div class="quality-fill" id="qualityFill"></div>
                    </div>
                    <div class="quality-value" id="qualityValue">0%</div>
                </div>

                <div class="lab-hint">
                    💡 Поддерживай температуру ~75°C и добавляй компоненты по целевым меткам
                </div>
            </div>
        `;

        this.setupControls();
    }

    setupControls() {
        // Температура
        document.getElementById('heatBtn').addEventListener('click', () => {
            this.temperature = Math.min(100, this.temperature + 5);
            this.updateDisplay();
        });

        document.getElementById('coolBtn').addEventListener('click', () => {
            this.temperature = Math.max(0, this.temperature - 5);
            this.updateDisplay();
        });

        // Компоненты
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const comp = btn.dataset.comp;
                if (this.components[comp] < 100) {
                    this.components[comp] = Math.min(100, this.components[comp] + 5);
                    this.updateDisplay();
                }
            });
        });
    }

    start() {
        this.gameInterval = setInterval(() => {
            this.time--;

            // Температура медленно падает
            this.temperature = Math.max(0, this.temperature - 1);

            // Риск взрыва при перегреве
            if (this.temperature > 90) {
                this.explosionRisk += 5;
                this.createBubble();
            } else if (this.explosionRisk > 0) {
                this.explosionRisk = Math.max(0, this.explosionRisk - 2);
            }

            // Взрыв при критическом риске
            if (this.explosionRisk >= 100) {
                this.explode();
                return;
            }

            // Check for perfect temperature
            const tempDiff = Math.abs(this.temperature - this.targetTemp);
            if (tempDiff <= 5) {
                this.perfectStreak++;
                if (this.perfectStreak % 3 === 0) {
                    this.showTempPerfect();
                }
            } else {
                this.perfectStreak = 0;
            }

            this.updateDisplay();
            this.calculateQuality();

            if (this.time <= 0) {
                this.end();
            }
        }, 1000);
    }

    createBubble() {
        const bubblesContainer = document.getElementById('reactionBubbles');
        if (!bubblesContainer) return;

        const bubble = document.createElement('div');
        bubble.className = 'reaction-bubble';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.animationDuration = (1 + Math.random()) + 's';

        bubblesContainer.appendChild(bubble);

        setTimeout(() => bubble.remove(), 2000);
    }

    showTempPerfect() {
        const indicator = document.getElementById('tempIndicator');
        if (indicator) {
            indicator.style.boxShadow = '0 0 20px #10b981';
            setTimeout(() => {
                indicator.style.boxShadow = '0 0 10px #fff';
            }, 300);
        }
    }

    explode() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }

        // Визуальный эффект взрыва
        this.container.innerHTML = `
            <div class="explosion-screen">
                <div class="explosion-effect">💥</div>
                <div class="explosion-text">ВЗРЫВ!</div>
                <div class="explosion-desc">Смесь перегрелась и детонировала</div>
            </div>
        `;

        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete({
                    quality: 0,
                    grade: 'ВЗРЫВ',
                    gradeColor: '#ef4444',
                    explosion: true
                });
            }
        }, 2000);
    }

    updateDisplay() {
        // Таймер
        document.getElementById('cookTimer').textContent = this.time + 's';

        // Температура
        document.getElementById('tempValue').textContent = Math.floor(this.temperature) + '°C';
        const tempIndicator = document.getElementById('tempIndicator');
        if (tempIndicator) {
            tempIndicator.style.bottom = this.temperature + '%';
        }

        // Risk warning
        const riskWarning = document.getElementById('riskWarning');
        if (riskWarning) {
            if (this.explosionRisk > 50) {
                riskWarning.style.display = 'block';
            } else {
                riskWarning.style.display = 'none';
            }
        }

        // Компоненты
        document.getElementById('compA').style.width = this.components.a + '%';
        document.getElementById('compAVal').textContent = Math.floor(this.components.a) + '%';

        document.getElementById('compB').style.width = this.components.b + '%';
        document.getElementById('compBVal').textContent = Math.floor(this.components.b) + '%';

        document.getElementById('compC').style.width = this.components.c + '%';
        document.getElementById('compCVal').textContent = Math.floor(this.components.c) + '%';
    }

    calculateQuality() {
        let quality = 0;

        // Температура (40% оценки)
        const tempDiff = Math.abs(this.temperature - this.targetTemp);
        if (tempDiff <= this.tempTolerance) {
            quality += 40 * (1 - tempDiff / this.tempTolerance);
        }

        // Компоненты (60% оценки)
        const compA = 20 * (1 - Math.abs(this.components.a - this.targetComponents.a) / 100);
        const compB = 20 * (1 - Math.abs(this.components.b - this.targetComponents.b) / 100);
        const compC = 20 * (1 - Math.abs(this.components.c - this.targetComponents.c) / 100);

        quality += Math.max(0, compA) + Math.max(0, compB) + Math.max(0, compC);

        this.quality = Math.min(100, Math.max(0, quality));

        // Обновить UI
        document.getElementById('qualityFill').style.width = this.quality + '%';
        document.getElementById('qualityValue').textContent = Math.floor(this.quality) + '%';
    }

    end() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }

        this.calculateQuality();

        let grade = '';
        let gradeColor = '';

        if (this.quality >= 90) {
            grade = 'ИДЕАЛЬНО';
            gradeColor = '#10b981';
        } else if (this.quality >= 75) {
            grade = 'ОТЛИЧНО';
            gradeColor = '#3b82f6';
        } else if (this.quality >= 60) {
            grade = 'ХОРОШО';
            gradeColor = '#f59e0b';
        } else if (this.quality >= 40) {
            grade = 'ПРИЕМЛЕМО';
            gradeColor = '#ef4444';
        } else {
            grade = 'БРАК';
            gradeColor = '#64748b';
        }

        setTimeout(() => {
            if (this.onComplete) {
                this.onComplete({
                    quality: Math.floor(this.quality),
                    grade,
                    gradeColor
                });
            }
        }, 500);
    }

    destroy() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }
}

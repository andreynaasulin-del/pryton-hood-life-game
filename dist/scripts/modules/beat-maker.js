/**
 * BEAT MAKER MINI-GAME
 * Ритм-игра для записи треков в студии
 */

export class BeatMaker {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.hits = 0;
        this.misses = 0;
        this.beats = [];
        this.gameInterval = null;
        this.bpm = 120;
        this.duration = 20000; // 20 секунд
        this.startTime = 0;
    }

    init(container) {
        this.container = container;
        this.render();
        this.start();
    }

    render() {
        this.container.innerHTML = `
            <div class="beatmaker-game">
                <div class="beatmaker-header">
                    <div class="beatmaker-stats">
                        <div class="stat">
                            <span class="stat-label">SCORE</span>
                            <span class="stat-value" id="bmScore">0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">COMBO</span>
                            <span class="stat-value" id="bmCombo">x0</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">TIME</span>
                            <span class="stat-value" id="bmTime">20s</span>
                        </div>
                    </div>
                </div>

                <div class="beatmaker-track">
                    <div class="beat-lane" id="beatLane">
                        <div class="hit-zone"></div>
                    </div>
                </div>

                <div class="beatmaker-controls">
                    <button class="beat-btn" id="hitBtn">HIT</button>
                    <div class="beat-hint">Нажми SPACE или кликни, когда бит в зоне!</div>
                </div>

                <div class="beatmaker-progress">
                    <div class="progress-bar" id="bmProgress"></div>
                </div>
            </div>
        `;

        this.setupControls();
    }

    setupControls() {
        const hitBtn = document.getElementById('hitBtn');
        const lane = document.getElementById('beatLane');

        const hit = () => this.checkHit();

        if (hitBtn) {
            hitBtn.addEventListener('click', hit);
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameInterval) {
                e.preventDefault();
                hit();
            }
        });
    }

    start() {
        this.startTime = Date.now();
        this.score = 0;
        this.combo = 0;
        this.hits = 0;
        this.misses = 0;

        this.spawnBeats();
        this.gameInterval = setInterval(() => this.update(), 100);
    }

    spawnBeats() {
        const beatInterval = 60000 / this.bpm; // Интервал между битами
        const beatCount = Math.floor(this.duration / beatInterval);

        for (let i = 0; i < beatCount; i++) {
            setTimeout(() => {
                this.createBeat();
            }, i * beatInterval);
        }

        // Финиш
        setTimeout(() => this.end(), this.duration);
    }

    createBeat() {
        const lane = document.getElementById('beatLane');
        if (!lane) return;

        const beat = document.createElement('div');
        beat.className = 'beat';
        beat.textContent = '🎵';
        beat.style.animationDuration = '2s'; // Время движения бита
        beat.dataset.created = Date.now();

        lane.appendChild(beat);

        // Удалить после прохождения
        setTimeout(() => {
            if (beat.parentElement) {
                beat.remove();
                // Автоматический промах если не нажал
                if (!beat.dataset.hit) {
                    this.miss();
                }
            }
        }, 2000);
    }

    checkHit() {
        const lane = document.getElementById('beatLane');
        if (!lane) return;

        const beats = lane.querySelectorAll('.beat:not([data-hit])');
        const hitZone = lane.querySelector('.hit-zone');
        const hitZoneRect = hitZone.getBoundingClientRect();

        let bestBeat = null;
        let bestDistance = Infinity;

        beats.forEach(beat => {
            const beatRect = beat.getBoundingClientRect();
            const distance = Math.abs(beatRect.left + beatRect.width / 2 - (hitZoneRect.left + hitZoneRect.width / 2));

            if (distance < bestDistance) {
                bestDistance = distance;
                bestBeat = beat;
            }
        });

        if (bestBeat) {
            bestBeat.dataset.hit = 'true';

            // Определяем качество попадания
            let feedback = '';
            let points = 0;

            if (bestDistance < 30) {
                feedback = 'PERFECT!';
                points = 100;
                this.combo++;
                this.showFeedback(feedback, 'perfect');
            } else if (bestDistance < 60) {
                feedback = 'GOOD';
                points = 50;
                this.combo++;
                this.showFeedback(feedback, 'good');
            } else {
                feedback = 'MISS';
                this.combo = 0;
                this.showFeedback(feedback, 'miss');
                this.misses++;
                bestBeat.remove();
                return;
            }

            this.hits++;
            this.score += points * (1 + this.combo * 0.1);
            this.updateUI();

            // Анимация попадания
            bestBeat.style.transform = 'scale(1.3)';
            bestBeat.style.background = 'linear-gradient(135deg, #10b981, #3b82f6)';
            setTimeout(() => bestBeat.remove(), 200);
        }
    }

    miss() {
        this.combo = 0;
        this.misses++;
        this.updateUI();
    }

    showFeedback(text, type) {
        const lane = document.getElementById('beatLane');
        if (!lane) return;

        const feedback = document.createElement('div');
        feedback.className = `hit-feedback ${type}`;
        feedback.textContent = text;
        feedback.style.left = '50%';
        feedback.style.top = '50%';

        lane.appendChild(feedback);
        setTimeout(() => feedback.remove(), 500);
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(100, (elapsed / this.duration) * 100);
        const timeLeft = Math.max(0, Math.ceil((this.duration - elapsed) / 1000));

        document.getElementById('bmProgress').style.width = progress + '%';
        document.getElementById('bmTime').textContent = timeLeft + 's';
    }

    updateUI() {
        document.getElementById('bmScore').textContent = Math.floor(this.score);
        document.getElementById('bmCombo').textContent = 'x' + this.combo;
    }

    end() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }

        // Вычисляем качество трека
        const accuracy = this.hits / (this.hits + this.misses) || 0;
        const quality = Math.min(100, Math.floor(accuracy * 100 + this.score / 50));

        // Показываем результат
        setTimeout(() => {
            if (window.uiManager) {
                let resultText = '';
                let resultColor = '';

                if (quality >= 90) {
                    resultText = '🔥 БЭНГЕР!';
                    resultColor = '#10b981';
                } else if (quality >= 70) {
                    resultText = '✅ ГОДНЫЙ ТРЕК';
                    resultColor = '#3b82f6';
                } else if (quality >= 50) {
                    resultText = '⚠️ СОЙДЁТ';
                    resultColor = '#f59e0b';
                } else {
                    resultText = '❌ МУСОР';
                    resultColor = '#ef4444';
                }

                const result = {
                    quality,
                    score: Math.floor(this.score),
                    hits: this.hits,
                    misses: this.misses,
                    accuracy: Math.floor(accuracy * 100),
                    verdict: resultText
                };

                // Передаём результат в callback
                if (this.onComplete) {
                    this.onComplete(result);
                }

                window.uiManager.showModal(
                    result.verdict,
                    `<div style="text-align:center; color: ${resultColor};">
                        <div style="font-size: 3rem; margin-bottom: 15px;">${resultText}</div>
                        <div style="color: #cbd5e1;">
                            <p>Score: ${result.score}</p>
                            <p>Качество: ${result.quality}%</p>
                            <p>Попадания: ${result.hits} / Промахи: ${result.misses}</p>
                            <p>Точность: ${result.accuracy}%</p>
                        </div>
                    </div>`,
                    [{ text: 'OK', action: () => { } }]
                );
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

import { gameState } from '../game-state.js';

const ThimblesGame = {
    ballPosition: 0, // 0, 1, 2
    isShuffling: false,
    bet: 100,

    initialized: false,
    uiManager: null,

    init(manager) {
        if (this.initialized) return;
        console.log('[Thimbles] Initializing...');
        this.uiManager = manager;
        this.initialized = true;
        const t1 = document.getElementById('thimble1');
        const t2 = document.getElementById('thimble2');
        const t3 = document.getElementById('thimble3');
        const btn = document.getElementById('thimblesPlayBtn');

        if (!t1 || !t2 || !t3 || !btn) {
            console.warn('[Thimbles] Missing DOM elements, skipping full init');
            return;
        }

        this.el = {
            thimbles: [t1, t2, t3],
            btn: btn,
            ghostBtn: document.getElementById('ghostLuckThimblesBtn')
        };

        // Initialize DOM structure for cups and balls
        this.el.thimbles.forEach(t => {
            if (t) {
                t.innerHTML = `
                    <div class="thimble-cup">
                        <div class="cup-body"></div>
                        <div class="cup-rim"></div>
                    </div>
                    <div class="thimble-ball"></div>
                `;
            }
        });

        // Привязка кнопки Старт
        if (this.el.btn) {
            const newBtn = this.el.btn.cloneNode(true);
            this.el.btn.parentNode.replaceChild(newBtn, this.el.btn);
            newBtn.addEventListener('click', () => this.play());
            this.el.btn = newBtn;
        }

        // Привязка кликов по наперсткам
        this.el.thimbles.forEach((t, index) => {
            if (t) t.onclick = () => this.check(index);
        });

        // Призрачная удача
        if (window.uiManager && this.el.ghostBtn) {
            window.uiManager.bindSafeClick('ghostLuckThimblesBtn', () => this.activateXRay());
        }

        // Bind to window for HTML access
        window.thimblesGame = this;
    },

    setBet(amount) {
        if (this.isShuffling || (this.el.btn.textContent === "ВЫБЕРИ СТАКАН")) return;

        this.bet = amount;
        const input = document.getElementById('thimblesBetInput');
        if (input) input.value = amount;

        this.updatePlayButton();
    },

    updateBetFromInput() {
        if (this.isShuffling || (this.el.btn.textContent === "ВЫБЕРИ СТАКАН")) return;

        const input = document.getElementById('thimblesBetInput');
        if (input) {
            let val = parseInt(input.value);
            if (isNaN(val) || val < 10) val = 10;
            this.bet = val;
            this.updatePlayButton();
        }
    },

    updatePlayButton() {
        if (this.el.btn) {
            this.el.btn.textContent = `КРУТИТЬ (${this.bet})`;
        }
    },

    open() {
        // Re-attempt init if it failed due to missing DOM
        if (!this.initialized || !this.el) {
            this.init(this.uiManager || window.uiManager);
        }
        // Reset state
        this.isShuffling = false;
        if (this.el && this.el.btn) {
            this.el.btn.disabled = false;
            // Update for v4 button
            const span = this.el.btn.querySelector('span');
            if (span) {
                span.textContent = 'ПЕРЕМЕШАТЬ';
            }
            this.el.thimbles.forEach(t => {
                t.className = 'thimble-v4';
                t.style.transform = 'none';
                t.style.opacity = '1';
                t.classList.remove('lifted', 'has-ball', 'win', 'lose');
            });
        }

        // Render Lucide icons
        if (window.lucide) window.lucide.createIcons();
    },

    play() {
        if (this.isShuffling) return;
        const casino = gameState.getState().casino;

        // КРИТИЧНО: Валидация ставки
        if (isNaN(this.bet) || this.bet <= 0) {
            gameState.addLogEntry("Неверная ставка!", "spirit");
            return;
        }

        if (casino.chips < this.bet) {
            gameState.addLogEntry("Не хватает фишек!", "spirit");
            return;
        }

        casino.chips -= this.bet;
        if (window.uiManager) window.uiManager.renderCasinoStatus();

        this.isShuffling = true;
        this.el.btn.disabled = true;
        this.el.btn.textContent = "ПЕРЕМЕШИВАЕМ...";

        // Reset cups
        this.el.thimbles.forEach(t => {
            t.className = 'thimble';
            t.style.transform = 'translateY(0)';
            t.style.pointerEvents = 'none';
            t.classList.remove('lifted', 'has-ball', 'win', 'lose');
        });

        // Remove ghost distortion
        const thimblesGame = document.querySelector('.thimbles-game');
        if (thimblesGame) {
            thimblesGame.classList.remove('ghost-distortion');
        }

        // Place ball
        this.ballPosition = Math.floor(Math.random() * 3);
        this.el.thimbles[this.ballPosition].classList.add('has-ball');

        // Show ball briefly then hide
        this.el.thimbles.forEach(t => t.classList.add('lifted'));

        setTimeout(() => {
            this.el.thimbles.forEach(t => t.classList.remove('lifted'));

            // Start shuffling after cups are down
            setTimeout(() => {
                this.startShuffle();
            }, 500);
        }, 1000);
    },

    startShuffle() {
        let swaps = 0;
        const maxSwaps = 10; // Количество перемещений
        const swapSpeed = 400; // Скорость одного перемещения (мс)

        // Определяем текущие позиции (визуальные слоты) для каждого стакана
        // Изначально: cup0 -> slot0, cup1 -> slot1, cup2 -> slot2
        // slotPositions хранит координаты X для слотов 0, 1, 2
        const cupWidth = 100;
        const gap = 60; // Из CSS .thimbles-table gap: 60px
        const slotDistance = cupWidth + gap;

        // Текущий визуальный слот для каждого стакана (индекс стакана -> индекс слота)
        const cupSlots = [0, 1, 2];

        const performSwap = () => {
            if (swaps >= maxSwaps) {
                this.readyToPick();
                return;
            }

            swaps++;

            // Выбираем два случайных РАЗНЫХ слота для обмена
            const slotA = Math.floor(Math.random() * 3);
            let slotB = Math.floor(Math.random() * 3);
            while (slotB === slotA) {
                slotB = Math.floor(Math.random() * 3);
            }

            // Находим, какие стаканы сейчас в этих слотах
            const cupIndexA = cupSlots.findIndex(slot => slot === slotA);
            const cupIndexB = cupSlots.findIndex(slot => slot === slotB);

            // Обновляем данные о слотах
            cupSlots[cupIndexA] = slotB;
            cupSlots[cupIndexB] = slotA;

            // Визуально перемещаем стаканы
            // slot 0 = 0px, slot 1 = 160px, slot 2 = 320px (примерно)
            // Но лучше считать относительно начальной позиции.
            // Изначально все стаканы стоят в своих слотах (transform: none).
            // Если стакан 0 перемещается в слот 1, ему нужно transform: translateX(160px).
            // Если стакан 2 перемещается в слот 0, ему нужно transform: translateX(-320px).

            const cupA = this.el.thimbles[cupIndexA];
            const cupB = this.el.thimbles[cupIndexB];

            // Z-index trick: один стакан проходит над другим
            const zIndex = 10 + swaps;
            cupA.style.zIndex = Math.random() > 0.5 ? zIndex : zIndex - 1;
            cupB.style.zIndex = Math.random() > 0.5 ? zIndex : zIndex - 1;

            cupA.style.transform = `translateX(${(cupSlots[cupIndexA] - cupIndexA) * slotDistance}px)`;
            cupB.style.transform = `translateX(${(cupSlots[cupIndexB] - cupIndexB) * slotDistance}px)`;

            // Звук перемещения (опционально, если есть аудио система)
            // gameState.playSound('swoosh');

            setTimeout(performSwap, swapSpeed);
        };

        performSwap();
    },

    readyToPick() {
        this.el.thimbles.forEach(t => {
            t.style.transform = 'none';
            t.style.cursor = 'pointer';
            t.style.pointerEvents = 'auto'; // ГАРАНТИРУЕМ КЛИКАБЕЛЬНОСТЬ
            t.classList.add('clickable'); // Для CSS hover эффектов
        });

        this.el.btn.textContent = "ВЫБЕРИ СТАКАН";
        this.el.btn.classList.add('pulse-action'); // Подсветка действия
    },

    check(index) {
        // Проверка состояния игры
        if (this.el.btn.textContent !== "ВЫБЕРИ СТАКАН") return;

        // Блокируем повторные клики
        this.el.thimbles.forEach(t => {
            t.style.pointerEvents = 'none';
            t.classList.remove('clickable');
        });
        this.el.btn.classList.remove('pulse-action');

        // Reveal all
        this.el.thimbles.forEach((t, i) => {
            t.classList.add('lifted');
            if (i !== this.ballPosition) {
                t.style.opacity = '0.4';
            }
        });

        if (index === this.ballPosition) {
            const win = this.bet * 3;
            const casino = gameState.getState().casino;
            casino.chips += win;
            if (window.uiManager) window.uiManager.renderCasinoStatus();

            gameState.addLogEntry(`Наперстки: Угадал! +${win}`, "good");
            this.el.thimbles[index].classList.add('win');

            // Win effect
            this.createConfetti(this.el.thimbles[index]);
        } else {
            gameState.addLogEntry(`Наперстки: Мимо.`, "neutral");
            this.el.thimbles[index].classList.add('lose');
            // Show correct one
            this.el.thimbles[this.ballPosition].classList.add('correct-reveal');
        }

        setTimeout(() => {
            this.el.btn.disabled = false;
            this.el.btn.textContent = `КРУТИТЬ (${this.bet})`;
            this.el.thimbles.forEach(t => {
                t.style.opacity = '1';
                t.style.pointerEvents = 'auto';
                t.classList.remove('lifted', 'win', 'lose', 'correct-reveal');
            });
        }, 2500);
    },

    createConfetti(element) {
        // Simple particle effect
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // В реальном проекте здесь можно вызвать систему частиц
        // Пока просто добавим класс для CSS анимации
        element.classList.add('confetti-burst');
    },

    activateXRay() {
        if (this.el.btn.textContent !== "ВЫБЕРИ СТАКАН") {
            gameState.addLogEntry("Сначала начни игру!", "spirit");
            return;
        }

        // Проверь ресурсы (HP >= 10)
        if (gameState.stats.health < 10) {
            gameState.addLogEntry("Недостаточно здоровья для призрачной удачи!", "spirit");
            return;
        }

        // Спиши 10 HP
        gameState.updateStat('health', -10);

        // Найди правильный наперсток
        const correctThimble = this.el.thimbles[this.ballPosition];
        if (correctThimble) {
            correctThimble.classList.add('ghost-hint');

            // Remove hint after 1 second to make it harder
            setTimeout(() => {
                correctThimble.classList.remove('ghost-hint');
            }, 1000);
        }

        gameState.addLogEntry("Дух подсвечивает правильный выбор...", "spirit");
    }
};

export default ThimblesGame;

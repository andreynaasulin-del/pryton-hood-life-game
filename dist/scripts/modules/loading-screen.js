// modules/loading-screen.js

class LoadingScreen {
  constructor() {
    this.root = document.getElementById('loadingScreen');
    this.percentEl = document.getElementById('loadingPercentage');
    this.textEl = document.getElementById('loadingText');
    this.ringEl = document.getElementById('portalRing');
    this.ghostEl = document.getElementById('ghostImage');

    this.current = 0;
    this.target = 0;
    this.speed = 0.15; // плавность анимации (0.1-0.3 норм)
    this.rafId = null;
    this.active = false;

    this.firstRunKey = 'dp_intro_seen';

    this.spiritLines = [
      'ДУХ ПРИТОНА входит в сеть...',
      'Собираем сигналы из проводки...',
      'Синхронизируем притон и трип...',
      'Поднимаем дэмки из подвала...',
      'Калибруем шум района под бит...',
      'Фиксируем сделку и запускаем ход...'
    ];

    this.phaseTimer = null;
    this.titleEl = document.getElementById('loadingTitle');
    this._bindParallax();
  }

  async start() {
    if (!this.root) return;

    this.active = true;
    this.current = 0;
    this.target = 0;

    this.root.style.display = 'flex';
    requestAnimationFrame(() => {
      this.root.classList.add('active');
    });

    this._startBlink();
    if (this.parallaxHandler) window.addEventListener('mousemove', this.parallaxHandler);
    this._loop();
    this._startPhaseCycle();

    // если это первый запуск - даем себе минимальный хронометраж, чтобы интро почувствовалось
    const firstRun = !localStorage.getItem(this.firstRunKey);
    this.minStartTime = performance.now();
    this.minDuration = firstRun ? 5000 : 800; // мс

    if (firstRun) {
      localStorage.setItem(this.firstRunKey, '1');
    }
  }

  setPhase(text) {
    if (this.textEl && text) {
      this.textEl.textContent = text;
    }
  }

  _startPhaseCycle() {
    if (!this.textEl) return;

    let index = 0;
    this.textEl.textContent = this.spiritLines[index];

    if (this.phaseTimer) clearInterval(this.phaseTimer);
    this.phaseTimer = setInterval(() => {
      if (!this.active) {
        clearInterval(this.phaseTimer);
        return;
      }
      index = (index + 1) % this.spiritLines.length;
      this.textEl.textContent = this.spiritLines[index];
    }, 1600);
  }

  _bindParallax() {
    this.parallaxHandler = (e) => {
      if (!this.active) return;

      const circle = this.ghostEl?.parentElement;
      const title = this.titleEl;

      if (!circle && !title) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      if (circle) {
        circle.style.transform = `translate3d(${x * 12}px, ${y * 8}px, 0) rotate(${x * 6}deg)`;
      }
      if (title) {
        title.style.transform = `translate3d(${x * -6}px, ${y * -4}px, 0)`;
      }
    };
  }

  // плавно тянем прогресс к целевому значению
  to(percent) {
    const safe = Math.max(0, Math.min(100, percent));
    if (safe > this.target) {
      this.target = safe;
    }
  }

  async complete() {
    // добегаем до 100 и ждем минимум по времени
    this.target = 100;

    const waitDone = new Promise((resolve) => {
      const check = () => {
        if (!this.active) {
          resolve();
          return;
        }
        if (this.current >= 99.5) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });

    const waitTime = new Promise((resolve) => {
      const now = performance.now();
      const left = Math.max(0, this.minDuration - (now - this.minStartTime));
      setTimeout(resolve, left);
    });

    await Promise.all([waitDone, waitTime]);
    this._hide();
  }

  _loop() {
    if (!this.active) return;

    // экспоненциальное сглаживание
    this.current += (this.target - this.current) * this.speed;
    const percentage = Math.floor(this.current);

    if (this.percentEl) {
      this.percentEl.textContent = `${percentage}%`;
    }

    // Update CSS variable for progress bar
    document.documentElement.style.setProperty(
      '--loading-progress',
      (this.current / 100).toString()
    );

    // if the ring is tied to a CSS variable - update
    if (this.ringEl) {
      this.ringEl.style.setProperty('--progress', this.current / 100);
    }

    this.rafId = requestAnimationFrame(() => this._loop());
  }

  _hide() {
    if (!this.root) return;

    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.phaseTimer) clearInterval(this.phaseTimer);

    if (this.parallaxHandler) window.removeEventListener('mousemove', this.parallaxHandler);

    this.root.classList.add('glitch-out');
    setTimeout(() => {
      this.root.classList.remove('active', 'glitch-out');
      this.root.style.display = 'none';
    }, 350); // под анимацию
  }

  _startBlink() {
    if (!this.ghostEl) return;

    const el = this.ghostEl;
    // дыхание делает CSS, тут только моргание

    const blink = () => {
      if (!this.active) return;

      if (Math.random() < 0.18) {
        el.classList.add('ghost-blink');
        setTimeout(() => {
          el.classList.remove('ghost-blink');
        }, 140);
      }

      if (this.active) {
        setTimeout(blink, 1300 + Math.random() * 1200);
      }
    };

    setTimeout(blink, 800);
  }
}

export const loadingScreen = new LoadingScreen();

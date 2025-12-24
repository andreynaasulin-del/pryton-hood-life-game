// Authentication Module - v4.0 (TACTICAL EDITION)
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = null;
    const isDev = window.location.port === '4173' || window.location.hostname === 'localhost';
    this.serverUrl = isDev ? 'http://localhost:3001' : '';
    this.isOffline = false;
    this.isAuthenticated = false;
    this.listenersInitialized = false;
  }

  // Initialize auth system
  async init() {
    console.log('[Auth] Initializing...');

    // Always setup listeners regardless of token status
    this.setupLoginListeners();

    if (this.token) {
      try {
        const isValid = await this.validateToken();
        if (isValid) {
          this.showGame();
        } else {
          this.showLogin();
        }
      } catch (error) {
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  }

  // Show login screen
  showLogin() {
    const loginOverlay = document.getElementById('loginOverlay');
    const app = document.getElementById('app');
    const loadingScreen = document.getElementById('loadingScreen');

    if (loginOverlay) loginOverlay.classList.add('active');
    if (app) app.classList.add('hidden');
    if (loadingScreen) loadingScreen.classList.remove('active');
  }

  // Show game transition
  async showGame() {
    const loginOverlay = document.getElementById('loginOverlay');
    const app = document.getElementById('app');
    const loadingScreen = document.getElementById('loadingScreen');
    const statusEl = loadingScreen?.querySelector('.loader-status');

    const updateStatus = (text) => {
      if (statusEl) statusEl.textContent = text.toUpperCase();
    };

    // 1. Show Loading Screen
    if (loadingScreen) {
      loadingScreen.classList.remove('fade-out');
      loadingScreen.classList.add('active');
    }
    if (loginOverlay) loginOverlay.classList.remove('active');

    // 2. Initialize the game core logic while loader is spinning
    try {
      updateStatus('ПОДКЛЮЧЕНИЕ К УЗЛУ ПРИТОНА...');
      await new Promise(r => setTimeout(r, 500));

      const { initGame } = await import('../main.js');
      if (initGame) {
        updateStatus('ЗАГРУЗКА БИОМЕТРИЧЕСКИХ ДАННЫХ...');
        await initGame();
      }

      updateStatus('СИНХРОНИЗАЦИЯ СЕРВЕРОВ...');
      await new Promise(r => setTimeout(r, 800));

      updateStatus('СОЕДИНЕНИЕ УСТАНОВЛЕНО');

      // 3. Fade out loading screen and show app
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('fade-out');
        if (app) app.classList.remove('hidden');

        setTimeout(() => {
          if (loadingScreen) {
            loadingScreen.classList.remove('active');
            loadingScreen.classList.remove('fade-out');
          }
        }, 1000);
      }, 1000);

    } catch (error) {
      console.error('[Auth] Failed to initialize game:', error);
      updateStatus('КРИТИЧЕСКИЙ СБОЙ ЯДРА');
      this.showMessage('ОШИБКА ИНИЦИАЛИЗАЦИИ КЕРНЕЛА', 'error');
    }
  }

  // Setup login form listeners
  setupLoginListeners() {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    document.body.addEventListener('click', (e) => {
      if (e.target.closest('#guestBtn')) {
        e.preventDefault();
        this.handleGuestLogin();
        return;
      }

      if (e.target.closest('#telegramBtn')) {
        e.preventDefault();
        this.handleTelegramLogin();
        return;
      }

      const tab = e.target.closest('.login-tab');
      if (tab) {
        e.preventDefault();
        document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
        const targetForm = document.querySelector(`.login-form[data-form="${tab.dataset.tab}"]`);
        if (targetForm) targetForm.classList.add('active');
        return;
      }
    });

    document.body.addEventListener('submit', (e) => {
      if (e.target.matches('.login-form[data-form="login"]')) {
        e.preventDefault();
        this.handleLogin();
      } else if (e.target.matches('.login-form[data-form="register"]')) {
        e.preventDefault();
        this.handleRegister();
      }
    });
  }

  // Handle login
  async handleLogin() {
    const userEl = document.getElementById('loginUsername');
    const passEl = document.getElementById('loginPassword');

    if (!userEl || !passEl) return;

    const username = userEl.value.trim();
    const password = passEl.value;

    if (!username || !password) {
      this.showMessage('ЗАПОЛНИТЕ ВСЕ ПОЛЯ', 'error');
      return;
    }

    // Admin Backdoor
    if (username === 'adminprytona') {
      this.token = 'admin-token';
      this.user = { username: 'adminprytona', role: 'admin' };
      this.isAuthenticated = true;
      localStorage.setItem('authToken', this.token);
      this.showMessage('ДОСТУП РАЗРЕШЕН (ADMIN)', 'success');
      setTimeout(() => this.showGame(), 500);
      return;
    }

    this.setLoading('loginBtn', true);

    try {
      const response = await fetch(`${this.serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;
        localStorage.setItem('authToken', this.token);
        this.showMessage('АВТОРИЗАЦИЯ УСПЕШНА', 'success');
        setTimeout(() => this.showGame(), 500);
      } else {
        this.showMessage(data.error || 'ОШИБКА ВХОДА', 'error');
      }
    } catch (error) {
      this.showMessage('СЕРВЕР НЕДОСТУПЕН', 'error');
    } finally {
      this.setLoading('loginBtn', false);
    }
  }

  // Handle register
  async handleRegister() {
    const username = document.getElementById('registerUsername')?.value.trim();
    const password = document.getElementById('registerPassword')?.value;

    if (!username || !password) {
      this.showMessage('ЗАПОЛНИТЕ ПОЛЯ', 'error');
      return;
    }

    this.setLoading('registerBtn', true);
    try {
      const response = await fetch(`${this.serverUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;
        localStorage.setItem('authToken', this.token);
        this.showMessage('АККАУНТ СОЗДАН', 'success');
        setTimeout(() => this.showGame(), 500);
      } else {
        this.showMessage(data.error || 'ОШИБКА РЕГИСТРАЦИИ', 'error');
      }
    } catch (error) {
      this.showMessage('ОШИБКА ПОДКЛЮЧЕНИЯ', 'error');
    } finally {
      this.setLoading('registerBtn', false);
    }
  }

  // Handle guest login
  handleGuestLogin() {
    this.isAuthenticated = false;
    this.isOffline = true;
    this.user = { username: 'ГОСТЬ', id: 'guest' };
    this.isGuest = true;
    this.showMessage('ГОСТЕВОЙ ДОСТУП...', 'success');
    setTimeout(() => this.showGame(), 500);
  }

  // Handle Telegram login
  async handleTelegramLogin() {
    if (window.Telegram?.WebApp?.initData) {
      const webApp = window.Telegram.WebApp;
      this.setLoading('telegramBtn', true);
      try {
        const response = await fetch(`${this.serverUrl}/api/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: webApp.initData })
        });

        const data = await response.json();
        if (response.ok) {
          this.token = data.token;
          this.user = data.user;
          this.isAuthenticated = true;
          localStorage.setItem('authToken', this.token);
          this.showMessage('TELEGRAM ВХОД ВЫПОЛНЕН', 'success');
          setTimeout(() => this.showGame(), 500);
        } else {
          this.showMessage(data.error || 'ОШИБКА TELEGRAM', 'error');
        }
      } catch (error) {
        this.showMessage('ОШИБКА ПОДКЛЮЧЕНИЯ', 'error');
      } finally {
        this.setLoading('telegramBtn', false);
      }
    } else {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        this.handleGuestLogin();
        return;
      }
      this.showMessage('ОТКРОЙТЕ В TELEGRAM', 'error');
    }
  }

  // Validate current token
  async validateToken() {
    if (!this.token) return false;
    try {
      const response = await fetch(`${this.serverUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        this.isAuthenticated = true;
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      this.isOffline = true;
      return false;
    }
  }

  // Logout
  logout() {
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('authToken');
    this.showLogin();
  }

  // Save game state
  async saveGameState(gameState) {
    if (this.isOffline || !this.isAuthenticated || this.isGuest) {
      try {
        localStorage.setItem('guestGameState', JSON.stringify(gameState));
      } catch (e) { console.error('Local save error', e); }
      return;
    }

    try {
      await fetch(`${this.serverUrl}/api/game/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify(gameState)
      });
    } catch (error) { console.warn('[Auth] Background save failed'); }
  }

  // Load game state
  async loadGameState() {
    if (this.isOffline || !this.isAuthenticated || this.isGuest) {
      const saved = localStorage.getItem('guestGameState');
      return saved ? JSON.parse(saved) : null;
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/game/load`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.gameState;
      }
    } catch (error) { console.error('Cloud load failed'); }
    return null;
  }

  // Utility functions
  showMessage(message, type = 'error') {
    const messageEl = document.getElementById('loginMessage');
    if (messageEl) {
      messageEl.textContent = message.toUpperCase();
      messageEl.className = `login-message ${type}`;
      setTimeout(() => { if (messageEl) messageEl.className = 'login-message'; }, 5000);
    }
  }

  setLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.disabled = loading;
      const text = loading ? 'ЗАГРУЗКА...' : (button.dataset.originalText || button.textContent);
      if (!button.dataset.originalText) button.dataset.originalText = button.textContent;
      button.textContent = text;
    }
  }
}

export const authManager = new AuthManager();

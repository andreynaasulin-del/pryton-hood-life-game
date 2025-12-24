import { gameState } from './game-state.js';
import { windowManager } from './core/WindowManager.js';
import { statsController } from './core/StatsController.js';
import { tickManager } from './core/TickManager.js';
import { audioSystem } from './audio-system.js';
import { visualFXManager } from './VisualFXManager.js';

// Tabs
import { HomeTab } from './tabs/HomeTab.js';
import { ClubTab } from './tabs/ClubTab.js';
import { PrisonTab } from './tabs/PrisonTab.js';
import { CasinoTab } from './tabs/CasinoTab.js';
import { ShopTab } from './tabs/ShopTab.js';
import { StreetTab } from './tabs/StreetTab.js';
import { DoctorTab } from './tabs/DoctorTab.js';
import { FarmTab } from './tabs/FarmTab.js';
import { MemoryTab } from './tabs/MemoryTab.js';
import { CasinoHTMLRenderer } from './casino/CasinoHTMLRenderer.js';
import { casinoProgression } from './casino-progression.js';

export class UIManager {
  constructor() {
    console.log('[UIManager] Constructing...');
    this.currentTab = 'home';
    this.tabs = {};
    this.casinoProgression = casinoProgression;

    // 1. Bind ALL methods first!
    this.updateGhostLuckButtons = this.updateGhostLuckButtons.bind(this);
    this.bindSafeClick = this.bindSafeClick.bind(this);
    this.backToLobby = this.backToLobby.bind(this);
    this.renderCasinoStatus = this.renderCasinoStatus.bind(this);
    this.applyGhostLuckEffect = this.applyGhostLuckEffect.bind(this);
    this.checkSecurityRaidTrigger = this.checkSecurityRaidTrigger.bind(this);
    this.triggerGuardBlock = this.triggerGuardBlock.bind(this);
    this.showToast = this.showToast.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    // 2. Set global early
    window.uiManager = this;
  }

  init() {
    console.log('[UIManager] Initializing logic...');

    // 3. Late initialization of tabs to avoid constructor race conditions
    this.tabs = {
      home: new HomeTab(this),
      club: new ClubTab(this),
      shop: new ShopTab(this),
      prison: new PrisonTab(this),
      casino: new CasinoTab(this),
      street: new StreetTab(this),
      doctor: new DoctorTab(this),
      farm: new FarmTab(this),
      memory: new MemoryTab(this)
    };

    visualFXManager.init();
    statsController.init();
    this.bindEvents();
    this.startHeartbeat();
    this.renderAll();

    // Init active tab
    if (this.tabs[this.currentTab]) {
      console.log(`[UIManager] Initializing current tab: ${this.currentTab}`);
      this.tabs[this.currentTab].init();
    }

    // Force prison check
    const state = gameState.getState();
    if (state.status === 'PRISON') {
      this.switchTab('prison', true);
    }

    // Subscribe to state changes for global status enforcement
    gameState.subscribe('change', (payload) => {
      if (payload.type === 'bulk' && payload.data.status === 'PRISON') {
        this.switchTab('prison', true);
      }
      if (payload.type === 'bulk' && payload.data.status === 'HOSPITAL') {
        this.switchTab('doctor', true);
      }
      if (payload.type === 'bulk' && payload.data.status === 'FREE' && (this.currentTab === 'prison' || this.currentTab === 'doctor')) {
        this.switchTab('home', true);
      }
    });

    gameState.subscribe('status:psychosis', () => {
      this.switchTab('doctor', true);
    });
  }

  // --- COMPATIBILITY HELPERS ---

  updateGhostLuckButtons() {
    const state = gameState.getState();
    const canUse = (state.stats?.health >= 10 || state.stats?.energy >= 10);

    const buttons = document.querySelectorAll('.btn-ghost-luck, #ghostLuckRouletteBtn, #ghostLuckDiceBtn, #ghostLuckSlotsBtn, #ghostLuckBJBtn, #ghostLuckThimblesBtn');
    buttons.forEach(btn => {
      btn.disabled = !canUse;
    });
  }

  bindSafeClick(id, callback) {
    const el = document.getElementById(id);
    if (el) {
      const newEl = el.cloneNode(true);
      if (el.parentNode) {
        el.parentNode.replaceChild(newEl, el);
      }
      newEl.onclick = callback;
      return newEl;
    }
    return null;
  }

  backToLobby() {
    console.log('[UIManager] Back to Lobby triggered');
    const gamesSection = document.querySelector('.c-games-section');
    const allGames = ['rouletteGame', 'diceGame', 'slots-game-container', 'blackjackGame', 'thimblesGame', 'crashGame'];

    if (gamesSection) gamesSection.style.display = 'block';
    allGames.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    if (this.tabs.casino?.render) this.tabs.casino.render();
  }

  showCasinoGame(gameId) {
    console.log('[UIManager] Opening casino game:', gameId);

    // Hide lobby
    const lobby = document.querySelector('#casinoLobby');
    if (lobby) lobby.style.display = 'none';

    // Get game config
    const game = CasinoHTMLRenderer.getGameConfig(gameId);
    if (!game) {
      console.error('[UIManager] Unknown casino game:', gameId);
      return;
    }

    // Render game HTML
    const container = document.getElementById(game.container);
    if (container) {
      container.innerHTML = game.html;
      container.style.display = 'flex';
    }

    // Call the game's open method
    import(`./games/${gameId.charAt(0).toUpperCase() + gameId.slice(1)}.js`).then(module => {
      const gameModule = module.default;
      if (gameModule) {
        if (gameModule.init && !gameModule.initialized) {
          gameModule.init(this);
        }
        if (gameModule.open) {
          gameModule.open();
        }
      }
    });
  }

  backToLobby() {
    console.log('[UIManager] Back to Lobby triggered');
    const lobby = document.querySelector('#casinoLobby');
    if (lobby) lobby.style.display = 'grid';

    // Hide all game containers
    document.querySelectorAll('.c-game-view, #slots-game-container').forEach(el => {
      el.style.display = 'none';
      el.innerHTML = ''; // Clear sub-elements to prevent ID duplication
    });
  }

  renderCasinoStatus() {
    if (this.tabs.casino?.render) this.tabs.casino.render();
  }

  applyGhostLuckEffect() {
    document.body.classList.add('ghost-luck-active');
    setTimeout(() => document.body.classList.remove('ghost-luck-active'), 500);
  }

  checkSecurityRaidTrigger(amount) {
    if (amount > 10000 && Math.random() > 0.7) {
      gameState.addLogEntry('Охрана казино что-то заподозрила...', 'danger');
    }
  }

  triggerGuardBlock() {
    gameState.addLogEntry('ПУТЬ ПЕРЕКРЫТ ОХРАНОЙ!', 'danger');
  }

  // --- CORE UI METHODS ---

  // --- CORE UI METHODS ---

  bindEvents() {
    document.querySelectorAll('.app-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.view));
    });

    const closePhoneBtn = document.getElementById('closeChatBtn');
    if (closePhoneBtn) {
      closePhoneBtn.onclick = () => this.hidePhone();
    }
  }

  switchTab(viewName, forced = false) {
    if (!viewName || viewName === this.currentTab) return;

    const state = gameState.getState();
    // Lockdown check
    if (state.status === 'PRISON' && viewName !== 'prison' && !forced) {
      this.showToast('ВЫХОД ЗАПРЕЩЕН: ТЫ ПОД АРЕСТОМ', 'error');
      audioSystem.playError();
      return;
    }
    if (state.status === 'HOSPITAL' && viewName !== 'doctor' && !forced) {
      this.showToast('ТЕРАПИЯ НЕ ЗАВЕРШЕНА: ТЫ В КЛИНИКЕ', 'error');
      audioSystem.playError();
      return;
    }

    console.log(`[UIManager] Switching to tab: ${viewName}`);
    audioSystem.playTabSwitch();
    this.triggerTabGlitch();

    // Proactive Cleanup: Clear current container to prevent ID duplication and memory leaks
    const currentView = document.querySelector(`.view[data-view="${this.currentTab}"]`);
    if (currentView) {
      currentView.innerHTML = '<div class="ds-loading-screen ds-scanlines">DEFRAGMENTING_CORE...</div>';
    }

    if (this.tabs[this.currentTab]?.destroy) {
      this.tabs[this.currentTab].destroy();
    }

    this.currentTab = viewName;

    document.querySelectorAll('.app-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });
    document.querySelectorAll('.view').forEach(view => {
      view.classList.toggle('view-active', view.dataset.view === viewName);
    });

    if (this.tabs[viewName]) {
      this.tabs[viewName].init();
    }

    this.renderAll();
  }

  showPhone(contactId = null) {
    const overlay = document.getElementById('chatOverlay');
    if (overlay) {
      overlay.classList.add('active');
      // If contactId is provided, we could auto-select it here
      console.log(`[UIManager] Phone opened. Contact: ${contactId || 'None'}`);
    }
  }

  hidePhone() {
    const overlay = document.getElementById('chatOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  triggerTabGlitch() {
    const mainViews = document.querySelector('.main-views');
    if (!mainViews) return;

    mainViews.classList.add('glitch-active');
    setTimeout(() => mainViews.classList.remove('glitch-active'), 150);
  }

  renderAll() {
    this.updateGlobalHeader();
    if (this.tabs[this.currentTab]?.render) {
      this.tabs[this.currentTab].render();
    }
  }

  updateGlobalHeader() {
    const state = gameState.getState();

    const headerCash = document.querySelector('#headerCash .stat-value');
    const headerTime = document.querySelector('#headerTime .stat-value');
    const headerDay = document.querySelector('#headerDay .stat-value');

    if (headerCash) headerCash.textContent = Math.round(state.kpis?.cash || 0).toLocaleString();
    if (headerDay) headerDay.textContent = state.day || 1;

    if (headerTime) {
      const h = Math.floor((state.time?.minutes || state.time || 0) / 60).toString().padStart(2, '0');
      const m = ((state.time?.minutes || state.time || 0) % 60).toString().padStart(2, '0');
      headerTime.textContent = `${h}:${m}`;
    }

    this.updateBar('Health', state.stats?.health);
    this.updateBar('Energy', state.stats?.energy);
    this.updateBar('Hunger', state.stats?.hunger);
    this.updateBar('Mood', state.stats?.mood);

    // Navigation Lockdown Visual State
    const appNav = document.querySelector('.app-nav');
    if (appNav) {
      appNav.classList.toggle('lockdown-active', state.status === 'PRISON');
    }
  }

  updateBar(name, value) {
    const val = Math.round(value || 0);
    const fill = document.getElementById(`bar${name}`);
    const label = document.getElementById(`val${name}`);
    const container = fill?.closest('.stat-bar-item');

    if (fill) fill.style.width = `${val}%`;
    if (label) label.textContent = val;

    if (container) {
      container.classList.toggle('critical', val < 20);
    }
  }

  startHeartbeat() {
    tickManager.subscribe(() => {
      this.updateGlobalHeader();
    });
  }

  showToast(text, type = 'info') {
    windowManager.showNotification(text, type);
  }

  showModal(title, content, actions) {
    return windowManager.showModal(title, content, actions);
  }

  hideModal() {
    windowManager.hideModal();
  }
}

const uiManager = new UIManager();
export default uiManager;

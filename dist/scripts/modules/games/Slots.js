import { gameState } from '../game-state.js';
import { authManager } from '../auth.js';

let uiManager;
let initialized = false;

// SVG Иконки для барабанов (Cyberpunk Style)
const SYMBOLS_SVG = {
    'ghost': `<svg viewBox="0 0 24 24" class="neon-icon ghost"><path fill="currentColor" d="M12 2a9 9 0 0 0-9 9v11l3-3 3 3 3-3 3 3 3-3 3 3V11a9 9 0 0 0-9-9z"/><circle cx="9" cy="10" r="2"/><circle cx="15" cy="10" r="2"/></svg>`,
    'seven': `<svg viewBox="0 0 24 24" class="neon-icon seven"><path fill="none" stroke="currentColor" stroke-width="3" d="M4 4h16l-8 16"/></svg>`,
    'diamond': `<svg viewBox="0 0 24 24" class="neon-icon diamond"><path fill="currentColor" d="M12 2L2 12l10 10 10-10L12 2z"/></svg>`,
    'bar': `<svg viewBox="0 0 24 24" class="neon-icon bar"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="16" font-size="10" text-anchor="middle" fill="currentColor" font-weight="bold">BAR</text></svg>`,
    'cherry': `<svg viewBox="0 0 24 24" class="neon-icon cherry"><circle cx="7" cy="17" r="4" fill="currentColor"/><circle cx="17" cy="17" r="4" fill="currentColor"/><path d="M7 13s5-10 10 0" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 6l3-3" stroke="currentColor" stroke-width="2"/></svg>`
};

const SlotsGame = {
    init(manager) {
        if (initialized) return;
        console.log('[Slots] Initializing...');
        uiManager = manager;
        initialized = true;
        this.initControls();
    },

    open() {
        // Re-attempt init if it failed due to missing DOM
        if (!initialized) {
            this.init(uiManager || window.uiManager);
        }
        const slotsGame = document.getElementById('slots-game-container');
        if (slotsGame) {
            slotsGame.style.display = 'flex';
        }

        // Update chips display
        const chipsEl = document.getElementById('slotsChips');
        if (chipsEl) {
            chipsEl.textContent = gameState.getState().casino?.chips || 0;
        }

        // Отрисовка начальных символов (статика)
        this.renderReel(0, 'seven');
        this.renderReel(1, 'seven');
        this.renderReel(2, 'seven');

        // Reinitialize controls after HTML injection
        this.initControls();

        // Render Lucide icons
        if (window.lucide) window.lucide.createIcons();
    },

    initControls() {
        const backBtn = document.getElementById('backToLobbyBtnSlots');
        if (backBtn) {
            const newBack = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBack, backBtn);
            newBack.addEventListener('click', () => {
                if (uiManager) uiManager.backToLobby();
            });
        }

        if (uiManager && uiManager.bindSafeClick) {
            uiManager.bindSafeClick('btn-spin', () => this.spin());
            uiManager.bindSafeClick('ghostLuckSlotsBtn', () => this.spin(true));
        }
    },

    getBet() {
        const input = document.getElementById('slotsBetInput');
        return input ? parseInt(input.value) : 0;
    },

    renderReel(index, symbolKey, isBlur = false) {
        const reel = document.getElementById(`slot-r${index + 1}`);
        if (!reel) return;

        if (isBlur) {
            reel.classList.add('spinning');
            reel.innerHTML = `<div class="blur-streak"></div>`;
        } else {
            reel.classList.remove('spinning');
            // Вставляем SVG
            const svg = SYMBOLS_SVG[symbolKey] || SYMBOLS_SVG['bar'];
            reel.innerHTML = `<div class="symbol-wrapper ${symbolKey}">${svg}</div>`;
        }
    },

    async spin(isGhostActive = false) {
        const state = gameState.getState();
        const casino = state.casino;
        const bet = this.getBet();

        if (isNaN(bet) || bet <= 0) {
            gameState.addLogEntry("Введите корректную ставку!", "spirit");
            return;
        }
        if (casino.chips < bet) {
            gameState.addLogEntry("Не хватает фишек!", "spirit");
            return;
        }

        // Ghost logic validation (local pre-check)
        if (isGhostActive && state.stats.health < 10) {
            gameState.addLogEntry("Мало здоровья!", "spirit");
            return;
        }

        const spinBtn = document.getElementById('btn-spin');
        if (spinBtn) spinBtn.disabled = true;
        document.getElementById('slot-status').textContent = "•••";

        // Start Animation (Blur)
        this.renderReel(0, null, true);
        this.renderReel(1, null, true);
        this.renderReel(2, null, true);

        const token = localStorage.getItem('authToken');
        const isOffline = authManager.isOffline || !token;

        if (!isOffline) {
            try {
                const response = await fetch(`${authManager.serverUrl}/api/casino/slots/spin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        gameState: state,
                        bet,
                        isGhostActive
                    })
                });

                if (response.ok) {
                    const data = await response.json();

                    // Animation delays
                    await new Promise(r => setTimeout(r, 600));
                    this.renderReel(0, data.result[0]);
                    await new Promise(r => setTimeout(r, 400));
                    this.renderReel(1, data.result[1]);
                    await new Promise(r => setTimeout(r, 400));
                    this.renderReel(2, data.result[2]);

                    // Update State from Server
                    gameState.updateState(data.gameState);

                    // Show Result (Server calculated message/win)
                    let color = "#666";
                    if (data.win > 0) {
                        if (data.win >= bet * 50) color = "#a855f7"; // Jackpot
                        else if (data.win >= bet * 20) color = "#fbbf24"; // 777
                        else if (data.win >= bet * 5) color = "#34d399"; // Triple
                        else color = "#60a5fa"; // Pair
                    }

                    this.displayWin(data.win, data.message, color);

                    if (spinBtn) spinBtn.disabled = false;
                    return;
                } else {
                    console.error('Server spin failed', await response.text());
                    gameState.addLogEntry("Ошибка сервера казино!", "bad");
                }
            } catch (e) {
                console.error('Network error during spin', e);
                gameState.addLogEntry("Ошибка сети! Переход в оффлайн-режим...", "neutral");
            }
        }

        // --- LOCAL LOGIC (Guest/Offline/Fallback) ---

        // Deduct resources locally
        if (isGhostActive) {
            gameState.updateStat('health', -10);
            uiManager.applyGhostLuckEffect();
        }
        casino.chips -= bet;
        if (uiManager) {
            uiManager.renderCasinoStatus();
            const globalChips = document.getElementById('casinoChips');
            if (globalChips) globalChips.textContent = casino.chips;
        }

        // Logic result
        const keys = Object.keys(SYMBOLS_SVG);
        const regularKeys = keys.filter(k => k !== 'ghost');

        let res = [];
        for (let i = 0; i < 3; i++) res.push(regularKeys[Math.floor(Math.random() * regularKeys.length)]);

        if (isGhostActive) {
            res[0] = 'ghost';
            res[1] = Math.random() > 0.5 ? 'ghost' : res[1];
        } else {
            if (Math.random() < 0.05) res = ['ghost', 'ghost', 'ghost'];
        }

        // Animation
        await new Promise(r => setTimeout(r, 600));
        this.renderReel(0, res[0]);

        await new Promise(r => setTimeout(r, 400));
        this.renderReel(1, res[1]);

        await new Promise(r => setTimeout(r, 400));
        this.renderReel(2, res[2]);

        this.checkWin(res, bet, isGhostActive);
        if (spinBtn) spinBtn.disabled = false;
    },

    checkWin(symbols, bet, isGhost) {
        const [s1, s2, s3] = symbols;
        let win = 0;
        let msg = "Пусто...";
        let color = "#666";

        if (s1 === s2 && s2 === s3) {
            if (s1 === 'ghost') { win = bet * 50; msg = "JACKPOT! ДУХИ С ТОБОЙ!"; color = "#a855f7"; }
            else if (s1 === 'seven') { win = bet * 20; msg = "777! БИНГО!"; color = "#fbbf24"; }
            else { win = bet * 5; msg = "ТРОЙНОЙ УЛОВ!"; color = "#34d399"; }
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            win = Math.floor(bet * 1.5);
            msg = "Пара. Неплохо.";
            color = "#60a5fa";
        }

        if (win > 0) {
            const casino = gameState.getState().casino;
            casino.chips += win;
            gameState.addLogEntry(`Слоты: +${win} фишек`, 'good');
        }

        this.displayWin(win, msg, color);
    },

    displayWin(win, msg, color) {
        const statusEl = document.getElementById('slot-status');
        if (statusEl) {
            statusEl.textContent = msg;
            statusEl.className = 'slots-status-v4';
            if (win > 0) {
                statusEl.classList.add('win');
            } else {
                statusEl.classList.add('lose');
            }
        }

        // Update local chips display
        const chipsEl = document.getElementById('slotsChips');
        if (chipsEl) {
            chipsEl.textContent = gameState.getState().casino?.chips || 0;
        }

        if (uiManager) {
            uiManager.renderCasinoStatus();
        }
    }
};

export default SlotsGame;

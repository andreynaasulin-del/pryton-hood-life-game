/**
 * CASINO UI RENDERER - V4.0 (ULTIMATE LUXURY NOIR)
 * Premier Underground High-Stakes Experience
 */
import { CASINO_DATA } from './CasinoData.js';
import { casinoProgression } from '../casino-progression.js';

export class CasinoUIRenderer {
    static renderMain(state) {
        const cp = state.casino || {};
        const userName = state.user?.username || 'ИГРОК_X';

        return `
            <div class="casino-layout-v4 luxury-noir ds-scanlines">
                ${this.renderHeader(state, cp, userName)}

                <div class="c-main-row-v4" id="casinoLobby">
                    <!-- 💎 VIP LOUNGE SIDEBAR (LEFT) -->
                    <aside class="c-col-v4 vip-sidebar">
                        <div class="luxury-module ds-panel-glass">
                            <div class="lm-header ds-heading ds-heading-sm" style="color: var(--ds-gold)">
                                <i data-lucide="crown"></i>
                                <span>VIP_РЕЙТИНГ</span>
                            </div>
                            <div class="rep-display-v4">
                                <div class="rd-rank ds-heading ds-heading-sm" style="font-size: 0.7rem; color: #fff">${(casinoProgression.getLevelName(cp.casinoLevel) || 'НОВИЧОК').toUpperCase()}</div>
                                <div class="ds-progress ds-progress-gold">
                                    <div class="ds-progress-fill" style="width: ${(cp.casinoXP || 0) / (cp.casinoXPRequired || 1000) * 100}%"></div>
                                </div>
                                <div class="rd-stats">
                                    <div class="stat-item">
                                        <span class="ds-label">LEVEL</span>
                                        <span class="ds-value gold">${cp.casinoLevel || 1}</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="ds-label">XP</span>
                                        <span class="ds-value gold" style="font-size: 0.85rem">${cp.casinoXP || 0}/${cp.casinoXPRequired || 1000}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="chip-management-v4 mt-3">
                                <button class="ds-btn-v2 primary gold-glow w-100 mb-10" id="buyChipsBtn" style="border-color: var(--ds-gold); color: var(--ds-gold)">
                                    <i data-lucide="plus-circle"></i>
                                    <span>КУПИТЬ ФИШКИ</span>
                                </button>
                                <button class="ds-btn-v2 ghost w-100" id="sellChipsBtn">
                                    <i data-lucide="banknote"></i>
                                    <span>ОБМЕНЯТЬ НА ₽</span>
                                </button>
                            </div>
                        </div>

                        <div class="luxury-module ds-panel-glass info-module">
                            <div class="lm-header ds-label">
                                <i data-lucide="shield-check"></i>
                                <span>БЕЗОПАСНОСТЬ</span>
                            </div>
                            <div class="security-status mt-2">
                                <div class="ss-dot pulse"></div>
                                <div class="ss-text ds-label">СИСТЕМА_ВЗЛОМА: <span class="ds-value cyan" style="font-size: 0.7rem">OFFLINE</span></div>
                            </div>
                            <p class="small-info ds-label" style="font-style: italic; margin-top: 10px">"Мы гарантируем анонимность каждой ставки. Спи спокойно."</p>
                        </div>
                    </aside>

                    <!-- 🎰 GAMES FLOOR (CENTER) -->
                    <main class="c-col-v4 games-floor">
                        <div class="luxury-module ds-panel-glass games-container">
                            <div class="lm-header ds-heading ds-heading-sm">
                                <i data-lucide="layout-grid"></i>
                                <span>ДОСТУПНЫЕ_СТОЛЫ // ЗАЛ_1</span>
                            </div>
                            <div class="games-grid-v4" id="casinoGamesGrid">
                                ${CASINO_DATA.games.map((g, idx) => `
                                    <div class="game-card-v4 action-card ds-panel-glass" data-game="${g.id}" style="--idx: ${idx}">
                                        <div class="gc-overlay-gold"></div>
                                        <div class="gc-icon-v4"><i data-lucide="${g.icon}"></i></div>
                                        <div class="gc-details">
                                            <div class="gc-tag ds-label">GAME_ID: 00${idx + 1}</div>
                                            <div class="gc-title-v4 ds-heading ds-heading-sm" style="font-size: 0.8rem; color: #fff">${g.name.toUpperCase()}</div>
                                            <div class="gc-desc-v4 ds-label">${g.desc}</div>
                                        </div>
                                        <div class="gc-action-v4">
                                            <div class="ds-btn-v2 ghost sm">ВХОД</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </main>

                    <!-- 📊 SESSION INTEL (RIGHT) -->
                    <aside class="c-col-v4 intel-sidebar">
                        <div class="luxury-module ds-panel-glass">
                            <div class="lm-header ds-label">
                                <i data-lucide="activity"></i>
                                <span>ПУЛЬС_ЗАВЕДЕНИЯ</span>
                            </div>
                            
                            <div class="intel-block-v4">
                                <div class="ib-hdr ds-label">ТЕКУЩИЙ_СТАТУС</div>
                                <div class="ib-status ds-heading ds-heading-sm" style="font-size: 0.7rem; color: var(--ds-gold)">ВЫ_В_ИГРЕ</div>
                                <div class="ds-divider"></div>
                                <div class="metrics-list-v4">
                                    <div class="metric-row-v4">
                                        <label class="ds-label">ПОСЛЕДНИЙ_ИТОГ</label>
                                        <span id="casinoLastResult" class="ds-value gold">-</span>
                                    </div>
                                    <div class="metric-row-v4">
                                        <label class="ds-label">ПРОФИТ_СЕССИИ</label>
                                        <span class="ds-value gold">₽0</span>
                                    </div>
                                    <div class="metric-row-v4">
                                        <label class="ds-label">УДАЧА_ДУХА</label>
                                        <span class="ds-value cyan">СТАБИЛЬНО</span>
                                    </div>
                                </div>
                            </div>

                            <div class="intel-block-v4 quote">
                                <i data-lucide="quote" class="quote-icon"></i>
                                <p class="ds-label" style="color: #fff; font-style: italic">"В этом зале удача не слепа. Она просто очень дорого стоит."</p>
                                <span class="quote-author ds-label">— ГРОССМЕЙСТЕР</span>
                            </div>
                        </div>
                    </aside>
                </div>

                <footer class="casino-footer-v4">
                    <div class="footer-line"></div>
                    <div class="footer-content ds-label">
                        <div class="fc-legal">© 2025 SPIRIT_OF_DEN // SECURE_LINE: 0x88</div>
                        <div class="fc-status">
                            <span class="status-item"><i data-lucide="wifi"></i> ENCRYPTED</span>
                            <span class="status-item"><i data-lucide="clock"></i> <span class="ds-value" style="font-size: 0.6rem; color: inherit">${new Date().toLocaleTimeString()}</span></span>
                        </div>
                    </div>
                </footer>

                <!-- 🕹️ GAME CONTAINERS -->
                <div id="slots-game-container" class="c-game-view" style="display:none"></div>
                <div id="diceGame" class="c-game-view" style="display:none"></div>
                <div id="rouletteGame" class="c-game-view" style="display:none"></div>
                <div id="blackjackGame" class="c-game-view" style="display:none"></div>
                <div id="thimblesGame" class="c-game-view" style="display:none"></div>
                <div id="crashGame" class="c-game-view" style="display:none"></div>
            </div>
        `;
    }

    static renderHeader(state, cp, userName) {
        return `
            <header class="c-header-v4">
                <div class="ch-left">
                    <div class="ds-label"><i data-lucide="map-pin"></i> CRYSTAL_PALACE // FLOOR_0</div>
                    <h1 class="ds-heading ds-heading-lg gold-glow" style="color: var(--ds-gold)">CASINO_NOIR</h1>
                    <div class="ch-welcome ds-label">ДОБРО_ПОЖАЛОВАТЬ, <span class="ds-value gold">${userName.toUpperCase()}</span></div>
                </div>
                <div class="ch-right">
                    <div class="balance-card-v4 ds-panel-glass">
                        <div class="bc-item cash">
                            <label class="ds-label">СЕЙФ ПРИТОНА</label>
                            <div class="ds-value gold" style="font-size: 1.5rem">₽${Math.round(state.kpis.cash).toLocaleString()}</div>
                        </div>
                        <div class="bc-divider"></div>
                        <div class="bc-item chips">
                            <label class="ds-label">ИГРОВЫЕ ФИШКИ</label>
                            <div class="ds-value gold" style="font-size: 1.5rem">${(cp.chips || 0).toLocaleString()} <i data-lucide="coins"></i></div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    static renderExchangeModal(type) {
        const isBuy = type === 'buy';
        const rateText = isBuy ? 'Курс: 1 фишка = 10₽' : 'Курс: 1 фишка = 9.5₽ (5% налог)';

        return `
            <div class="exchange-modal-v4 ds-scanlines">
                <div class="em-header">
                    <div class="em-icon ${isBuy ? 'buy' : 'sell'}">
                        <i data-lucide="${isBuy ? 'arrow-down-to-line' : 'arrow-up-from-line'}"></i>
                    </div>
                    <div class="em-info">
                        <div class="em-title">${isBuy ? 'ПОКУПКА_АКТИВОВ' : 'ЛИКВИДАЦИЯ_АКТИВОВ'}</div>
                        <div class="em-rate">${rateText}</div>
                    </div>
                </div>

                <div class="em-body">
                    <div class="em-field">
                        <label class="ds-label">КОЛИЧЕСТВО ФИШЕК</label>
                        <div class="em-input-wrap">
                            <input type="number" id="exchangeAmount" class="ds-input-large" placeholder="000" min="1" autofocus>
                            <div class="em-currency">CHIPS</div>
                        </div>
                    </div>

                    <div class="em-quick-amounts">
                        <button class="quick-btn" data-val="100">+100</button>
                        <button class="quick-btn" data-val="500">+500</button>
                        <button class="quick-btn" data-val="1000">+1K</button>
                        <button class="quick-btn" data-val="max">MAX</button>
                    </div>

                    <div class="em-preview-panel">
                        <div class="preview-item">
                            <label>ВЫ ОТДАЕТЕ</label>
                            <span id="exchangeGive">-</span>
                        </div>
                        <i data-lucide="arrow-right" class="preview-arrow"></i>
                        <div class="preview-item result">
                            <label>ВЫ ПОЛУЧИТЕ</label>
                            <span id="exchangePreview">₽0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

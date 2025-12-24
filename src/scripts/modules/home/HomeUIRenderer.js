import { smsSystem } from '../sms-system.js';

/**
 * HOME UI RENDERER - V8.0 (HEAVY INDUSTRIAL DECK)
 * Role: Lead UI Artist & Localization Expert
 */
export class HomeUIRenderer {
    static renderMain(state, self) {
        return `
            <div class="habitation-deck industrial-mode heavy-vfx">
                <div class="vignette-layer"></div>
                
                <!-- ГРИД-ИНТЕРФЕЙС -->
                <div class="hab-grid">
                    
                    <!-- 1. ФИНАНСОВЫЙ УЗЕЛ -->
                    <div class="hab-cell cell-bankroll bunk-panel ds-panel-glass">
                        <div class="panel-bolt top-left"></div>
                        <div class="panel-bolt top-right"></div>
                        <div class="panel-bolt bottom-left"></div>
                        <div class="panel-bolt bottom-right"></div>
                        <div class="tech-noise">SYS_OP_NORMAL // V.5.02</div>
                        ${this.renderBankroll(state)}
                    </div>

                    <!-- 2. ЖИЛОЙ МОДУЛЬ -->
                    <div class="hab-cell cell-hero bunk-panel ds-panel-glass">
                        <div class="panel-bolt top-left"></div>
                        <div class="panel-bolt top-right"></div>
                        <div class="panel-bolt bottom-left"></div>
                        <div class="panel-bolt bottom-right"></div>
                        <div class="tech-noise top-mid">MOD_STATUS: ACTIVE</div>
                        ${this.renderHero(state, self)}
                    </div>

                    <!-- 3. ПСИ-МОНИТОР -->
                    <div class="hab-cell cell-spirit bunk-panel ds-panel-glass">
                        <div class="panel-bolt top-left"></div>
                        <div class="panel-bolt top-right"></div>
                        <div class="panel-bolt bottom-left"></div>
                        <div class="panel-bolt bottom-right"></div>
                        <div class="tech-noise">NO_SIGNAL_DETECTION</div>
                        ${this.renderSpirit(state)}
                    </div>

                    <!-- 4. АКТИВНЫЕ КОНТРАКТЫ -->
                    <div class="hab-cell cell-quests bunk-panel ds-panel-glass">
                        <div class="panel-bolt top-left"></div>
                        <div class="panel-bolt top-right"></div>
                        <div class="panel-bolt bottom-left"></div>
                        <div class="panel-bolt bottom-right"></div>
                        ${this.renderQuests(state, self)}
                    </div>

                    <!-- 5. ПУЛЬТ УПРАВЛЕНИЯ -->
                    <div class="hab-cell cell-actions bunk-panel ds-panel-glass">
                        <div class="panel-bolt top-left"></div>
                        <div class="panel-bolt top-right"></div>
                        <div class="panel-bolt bottom-left"></div>
                        <div class="panel-bolt bottom-right"></div>
                        ${this.renderActions(state, self)}
                    </div>

                    <!-- 6. СТАТУС СИСТЕМ -->
                    <div class="hab-cell cell-status bunk-panel ds-panel-glass">
                        <div class="panel-bolt top-left"></div>
                        <div class="panel-bolt top-right"></div>
                        <div class="panel-bolt bottom-left"></div>
                        <div class="panel-bolt bottom-right"></div>
                        <div class="status-grid">
                            ${this.renderMiniSocial(state, self)}
                            ${this.renderMiniUpgrades(state, self)}
                        </div>
                    </div>

                </div>

                <footer class="hab-footer-bunk">
                    <div class="hf-line-rust"></div>
                    <div class="hf-wrap-bunk">
                        <div class="hf-tag-rus">ЦЕНТРАЛЬНЫЙ_ПРОЦЕССОР: СТАБИЛЬНО // ПИТАНИЕ: 220В</div>
                        <div class="hf-node-rus">ЛОКАЦИЯ: ПРИТОН_СЕКТОР_X</div>
                    </div>
                </footer>
            </div>
        `;
    }

    static renderBankroll(state) {
        return `
            <div class="terminal-module bank-terminal-bunk">
                <div class="tm-header-rus">
                    <span class="tm-label orbitron-text amber-glow">ФИНАНСОВЫЙ_УЗЕЛ</span>
                </div>
                <div class="tm-body">
                    <div class="cash-display-bunk">
                        <div class="cash-label-rus">ДОСТУПНЫЕ_СРЕДСТВА</div>
                        <div class="cash-value orbitron-text amber-glow">
                            ${Math.round(state.kpis?.cash || 0).toLocaleString()} <span>₽</span>
                        </div>
                        <div class="sparkline-container-bunk">
                            <svg class="sparkline-rust" viewBox="0 0 100 30" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="var(--bunk-amber)" stop-opacity="0.3" />
                                        <stop offset="100%" stop-color="var(--bunk-amber)" stop-opacity="0" />
                                    </linearGradient>
                                </defs>
                                <path class="sparkline-fill-rust" d="M0 30 L0 15 Q 10 5, 20 20 T 40 10 T 60 25 T 80 15 T 100 20 L 100 30 Z" fill="url(#goldGrad)" />
                                <path class="sparkline-line-rust" d="M0 15 Q 10 5, 20 20 T 40 10 T 60 25 T 80 15 T 100 20" />
                            </svg>
                        </div>
                    </div>
                    <div class="stats-mini-grid-bunk">
                        <div class="stat-mini">
                            <label>СЛАВА</label>
                            <span class="amber-glow">${state.kpis?.fame || 0}</span>
                        </div>
                        <div class="stat-mini">
                            <label>ХАЙП</label>
                            <span class="amber-glow">${state.kpis?.hype || 0}</span>
                        </div>
                        <div class="stat-mini">
                            <label>УВАЖЕНИЕ</label>
                            <span class="amber-glow">${state.kpis?.respect || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderHero(state, self) {
        const bought = self.upgrades.getPurchasedUpgrades();
        const modules = self.upgrades.getUpgrades();
        const home = state.home || { cleanliness: 75 };

        return `
            <div class="habitation-module-bunk">
                <div class="hm-header-rus">
                    <div class="hm-info">
                        <h2 class="hm-title orbitron-text amber-glow">ЖИЛОЙ_МОДУЛЬ_[СЕКТОР-X]</h2>
                        <span class="hm-sub">СЕКТОР-X // УРОВЕНЬ_САНИТАРИИ: ${home.cleanliness}%</span>
                    </div>
                    <div class="hm-sys-status amber-glow">СИСТЕМЫ_ЖИЗНЕОБЕСПЕЧЕНИЯ</div>
                </div>
                
                <div class="mod-grid-bunk shadow-mesh">
                    ${modules.map(mod => {
            const isOwned = bought.includes(mod.id);
            return `
                            <div class="mod-slot-bunk ${isOwned ? 'active-slot' : 'blocked-slot'}" ${!isOwned ? 'onclick="window.uiManager.switchTab(\'shop\')"' : ''}>
                                <div class="slot-depth"></div>
                                <div class="slot-content-bunk">
                                    ${isOwned ? `<i data-lucide="${mod.icon}"></i>` : `<i data-lucide="lock" class="lock-ico-rus blink-red"></i>`}
                                    <span class="mod-label-bunk">${mod.name.toUpperCase()}</span>
                                    ${!isOwned ? `<span class="blocked-tag-rus">[БЛОК]</span>` : ''}
                                </div>
                                ${!isOwned ? '<div class="hazard-stripes"></div>' : ''}
                            </div>
                        `;
        }).join('')}
                </div>

                <div class="habitation-footer-bunk-stats">
                    <div class="hf-stat-rus">
                        <span class="stat-ico-bunk">⚙️</span>
                        <span>ЗАЩИТА: ${home.security || 0}</span>
                    </div>
                    <div class="hf-stat-rus">
                        <span class="stat-ico-bunk">⚡</span>
                        <span>РЕГЕНЕРАЦИЯ: +${self.upgrades.getTotalEffects().energyRegen || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    static renderSpirit(state) {
        const s = state.spirit || { rage: 0, trust: 0 };
        const g = state.dailyGoal;

        return `
            <div class="spirit-monitor-bunk">
                <div class="sm-scanline-rust"></div>
                <div class="sm-header-rus">
                    <span class="orbitron-text amber-glow">ПСИ_МОНИТОР_УЗЕЛ</span>
                </div>
                
                <div class="sm-vitals-rus">
                    <div class="v-row-bunk">
                        <div class="v-label-rus">ПРОТОКОЛ_ЯРОСТИ</div>
                        <div class="v-bar-bunk"><div class="v-fill-rust rage-bar" style="width: ${s.rage}%"></div></div>
                    </div>
                    <div class="v-row-bunk">
                        <div class="v-label-rus">НЕЙРО_СВЯЗЬ</div>
                        <div class="v-bar-bunk"><div class="v-fill-rust trust-bar" style="width: ${s.trust}%"></div></div>
                    </div>
                </div>

                <div class="sm-output-bunk">
                    <div class="sm-text-bunk amber-glow">
                        ${g ? g.title.toUpperCase() : 'ТИШИНА В ЭФИРЕ'}
                    </div>
                    ${g ? `
                        <div class="sm-progress-rus">
                            <span class="smp-count-rus">${g.current} / ${g.target}</span>
                            <div class="smp-track-rus"><div class="smp-bar-rus" style="width: ${Math.min(100, (g.current / g.target) * 100)}%"></div></div>
                        </div>
                    ` : ''}
                </div>
                <div class="sm-footer-rus">ИНТЕНСИВНОСТЬ_СИГНАЛА: 88%</div>
            </div>
        `;
    }

    static renderQuests(state, self) {
        const active = state.quests?.active || [];
        return `
            <div class="task-module-bunk">
                <div class="tc-header-rus orbitron-text amber-glow">АКТИВНЫЕ_КОНТРАКТЫ</div>
                <div class="tc-list-rust">
                    ${active.length === 0 ? `
                        <div class="tc-empty-rus">НЕТ_ДАННЫХ_В_ПОТОКЕ</div>
                    ` : active.map(q => `
                        <div class="tc-entry-rust q-entry" data-quest-id="${q.id}">
                            <div class="tc-id-marker"></div>
                            <div class="tc-info-rus">
                                <span class="tc-title-rus">${q.title}</span>
                                <span class="tc-sub-rus">${q.giver || 'СИСТЕМА'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static renderActions(state, self) {
        return `
            <div class="action-module-bunk">
                <button class="bunk-toggle main-btn-bunk sleep-block" id="homeSleepBtn">
                    <div class="btn-icon-rus"><i data-lucide="moon"></i></div>
                    <div class="btn-text-rus">
                        <span class="bt-top">СПАТЬ</span>
                        <span class="bt-bottom">ЗАРЯД: 100% // ПЕРЕЗАГРУЗКА</span>
                    </div>
                </button>
                <div class="bunk-row">
                    <button class="bunk-toggle mini-btn-bunk food-block" id="homeSnackBtn">
                        <span>ЕДА</span>
                        <div class="mini-status">СЕРВИС: OK</div>
                    </button>
                    <button class="bunk-toggle mini-btn-bunk clean-block" id="homeCleanBtn">
                        <span>ПОРЯДОК</span>
                        <div class="mini-status">SYS: READY</div>
                    </button>
                </div>
            </div>
        `;
    }

    static renderMiniSocial(state, self) {
        return `
            <div class="bunk-card">
                <div class="bc-head">СЕТЬ_DARKGRAM</div>
                <div class="bc-body-rus">
                    <span>${smsSystem.getUnreadCount()} ВХОДЯЩИХ</span>
                </div>
            </div>
        `;
    }

    static renderMiniUpgrades(state, self) {
        return `
            <div class="bunk-card" onclick="window.uiManager.switchTab('shop')">
                <div class="bc-head">ОБОРУДОВАНИЕ</div>
                <div class="bc-body-rus">
                    <span>КАТАЛОГ_УЛУЧШЕНИЙ</span>
                </div>
            </div>
        `;
    }
}

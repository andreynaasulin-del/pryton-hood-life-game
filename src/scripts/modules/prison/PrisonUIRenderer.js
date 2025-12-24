/**
 * PRISON UI RENDERER - V5.0 (INDUSTRIAL DECAY)
 * Rusty terminal style for survival.
 */
export class PrisonUIRenderer {
    static renderMain(state, self) {
        const jailTime = state.jailTime || 0;
        const minutes = Math.floor(jailTime / 60);
        const seconds = jailTime % 60;
        const timerStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const stability = state.neuro?.stability || 0;
        const isLowStability = stability < 40;

        return `
            <div class="prison-layout-v5 ds-scanlines sepia-filter">
                ${this.renderHeader(timerStr)}
                
                <div class="p-main-row-v5">
                    <!-- 🎚️ CELL HUD -->
                    <aside class="p-sidebar-v5">
                        <div class="tactical-module ds-panel-glass">
                            <div class="tm-header-v5">
                                <i data-lucide="info"></i>
                                <span>ДАННЫЕ_ЗК</span>
                            </div>
                            <div class="p-labels-v5">
                                <div class="pl-item">
                                    <label>ЗДОРОВЬЕ</label>
                                    <div class="p-mini-bar"><div class="fill" style="width: ${state.stats.health}%"></div></div>
                                </div>
                                <div class="pl-item">
                                    <label>ЭНЕРГИЯ</label>
                                    <div class="p-mini-bar"><div class="fill yellow" style="width: ${state.stats.energy}%"></div></div>
                                </div>
                                <div class="pl-item">
                                    <label>СТАБИЛЬНОСТЬ</label>
                                    <div class="p-mini-bar"><div class="fill magenta" style="width: ${stability}%"></div></div>
                                </div>
                            </div>
                        </div>

                        <div class="cellmate-box ds-panel-glass mt-3">
                            <div class="cm-header-v5">СОКАМЕРНИК:</div>
                            <div class="cm-body">
                                <i data-lucide="ghost" class="ghost-icon ${isLowStability ? 'active' : ''}"></i>
                                <span>${isLowStability ? 'ПРИЗРАК: "Я ВЫТАЩУ ТЕБЯ..."' : 'ТЫ ОДИН В КАМЕРЕ'}</span>
                            </div>
                            ${isLowStability ? `
                                <button class="ds-btn-v2 ghost-btn mt-2" onclick="window.prisonSystem.handleGhostDeal()">
                                    СДЕЛКА ШРЁДИНГЕРА
                                </button>
                            ` : ''}
                        </div>
                    </aside>

                    <!-- 🎛️ PRISON ACTIONS -->
                    <main class="p-content-v5">
                        <div class="terminal-box ds-panel-glass">
                            <div class="tm-header-v5">КАМЕРА // ДОСТУПНЫЕ ДЕЙСТВИЯ</div>
                            
                            <div class="actions-grid-v5">
                                <div class="p-action-card" onclick="window.prisonSystem.doAction('pushups')">
                                    <i data-lucide="activity"></i>
                                    <div class="pa-info">
                                        <div class="pa-name">ОТЖИМАТЬСЯ</div>
                                        <div class="pa-desc">-20⚡ | +1 СИЛА | -1 МИН СРОКА</div>
                                    </div>
                                </div>

                                <div class="p-action-card" onclick="window.prisonSystem.doAction('cockroaches')">
                                    <i data-lucide="bug"></i>
                                    <div class="pa-info">
                                        <div class="pa-name">СЧИТАТЬ ТАРАКАНОВ</div>
                                        <div class="pa-desc">УБИТЬ ВРЕМЯ | СЛУЧАЙНЫЙ ЭФФЕКТ</div>
                                    </div>
                                </div>

                                <div class="p-action-card lawyer-card" onclick="window.prisonSystem.doAction('lawyer')">
                                    <i data-lucide="shield"></i>
                                    <div class="pa-info">
                                        <div class="pa-name">ЗВОНОК АДВОКАТУ</div>
                                        <div class="pa-desc">₽50,000 | МГНОВЕННЫЙ ВЫХОД</div>
                                    </div>
                                </div>
                            </div>

                            <div class="interrogation-trigger mt-3" id="interrogationBox" style="display:none;">
                                <div class="alert-box danger">
                                    <i data-lucide="alert-triangle"></i>
                                    <span>ВЫЗОВ НА ДОПРОС!</span>
                                    <button class="ds-btn-v2 primary" onclick="window.prisonSystem.startInterrogation()">ИДТИ</button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                <footer class="p-footer-v5">
                    <div class="ambient-viz">
                        ${Array(20).fill(0).map(() => `<div class="viz-drop"></div>`).join('')}
                    </div>
                </footer>
            </div>
        `;
    }

    static renderHeader(timer) {
        return `
            <header class="p-header-v5">
                <div class="ph-left">
                    <div class="ph-tag">ИЗОЛЯТОР // СЕКТОР_ЗЕРО</div>
                    <h2 class="ph-title-v5 glitch-text" data-text="ЗАКЛЮЧЕНИЕ">ЗАКЛЮЧЕНИЕ</h2>
                </div>
                <div class="ph-timer">
                    <label>ДО_ВЫХОДА:</label>
                    <span class="timer-val">${timer}</span>
                </div>
            </header>
        `;
    }

    static renderInterrogation(dialog) {
        return `
            <div class="interrogation-dialog">
                <p class="dialog-text">"${dialog.text}"</p>
                <div class="dialog-options">
                    ${dialog.options.map((opt, i) => `
                        <button class="ds-btn-v2" onclick="window.prisonSystem.answerInterrogation(${i})">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

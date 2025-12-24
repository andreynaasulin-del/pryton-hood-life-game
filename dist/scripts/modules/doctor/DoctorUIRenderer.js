/**
 * DOCTOR UI RENDERER - V5.0 (CLINICAL HORROR)
 */
export class DoctorUIRenderer {
    static renderMain(state, self, implants) {
        const neuro = state.neuro || {};
        const stability = neuro.stability || 0;
        const maxStability = neuro.maxStability || 100;
        const implantsOwned = neuro.implants || [];
        const isPsychosis = state.status === 'HOSPITAL';

        return `
            <div class="clinical-layout-v5 ds-scanlines clinical-flicker ${self.isTherapyActive ? 'therapy-active' : ''}">
                ${this.renderHeader(state)}
                
                <div class="d-grid-v5">
                    <!-- 🏥 THERAPY & MONITORING -->
                    <div class="therapy-panel-v5">
                        <div class="therapy-monitor ds-panel-glass">
                            <div class="monitor-wave"></div>
                            <div class="therapy-status">
                                <div class="ds-value ${self.isTherapyActive ? 'cyan' : (stability < 30 ? 'red' : 'cyan')}" style="font-size: 3rem">
                                    ${self.isTherapyActive ? self.therapyTime : stability}%
                                </div>
                                <div class="ds-label">${self.isTherapyActive ? 'СКАНИРОВАНИЕ_СИНАПСОВ' : 'СТАБИЛЬНОСТЬ'}</div>
                            </div>
                        </div>

                        <div class="clinic-actions-v5">
                            <div class="c-action-card ds-panel-glass" onclick="window.doctorTab.handleDetox()">
                                <div class="ds-label" style="opacity: 1; color: var(--dead-blue)"><i data-lucide="droplet"></i> ДЕТОКС ТЕЛА</div>
                                <div class="cac-body">Мгновенное восстановление HP</div>
                                <div class="ds-value gold mt-2" style="font-size: 0.9rem">₽5,000</div>
                            </div>
                            
                            <div class="c-action-card ds-panel-glass ${self.isTherapyActive ? 'mode-locked' : ''}" id="therapyBtn" onclick="window.doctorTab.handleTherapy()">
                                <div class="ds-label" style="opacity: 1; color: var(--dead-blue)"><i data-lucide="activity"></i> НЕЙРО-ТЕРАПИЯ</div>
                                <div class="cac-body">Глубокое восстановление рассудка</div>
                                <div class="ds-value gold mt-2" style="font-size: 0.9rem">₽8,000</div>
                            </div>
                        </div>

                        ${isPsychosis ? `
                            <div class="psychosis-alert ds-panel-glass mt-3">
                                <div class="pa-hdr ds-heading ds-heading-sm red">ВНИМАНИЕ: КРИТИЧЕСКИЙ ПСИХОЗ</div>
                                <p class="ds-label">Управление заблокировано. Требуется принудительное лечение.</p>
                                <button class="ds-btn-v2 primary w-100 mt-2" onclick="window.doctorTab.handleForcedTreatment()">ОПЛАТИТЬ ЛЕЧЕНИЕ (₽15,000)</button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- 🦾 CYBERNETICS -->
                    <aside class="implants-panel-v5 ds-panel-glass">
                        <div class="tm-header-v5 ds-heading ds-heading-sm"><i data-lucide="cpu"></i> КИБЕР-МАГАЗИН</div>
                        <div class="ip-info ds-label">МАКС_СТАБИЛЬНОСТЬ: <span class="ds-value">${maxStability}</span>/100</div>
                        <div class="implants-list">
                            ${implants.map(imp => {
            const isOwned = implantsOwned.includes(imp.id);
            return `
                                    <div class="implant-card ${isOwned ? 'purchased' : ''}" 
                                         ${!isOwned ? `onclick="window.doctorTab.buyImplant('${imp.id}')"` : ''}>
                                        <div class="name ds-heading-sm" style="font-size: 0.7rem">${imp.name.toUpperCase()}</div>
                                        <div class="perks ds-label">${imp.perks}</div>
                                        <div class="cost ds-value gold" style="font-size: 0.8rem">${isOwned ? 'УСТАНОВЛЕНО' : '₽' + imp.cost.toLocaleString()}</div>
                                        <div class="penalty ds-label red">Штраф: -${imp.stabilityPenalty} Stability</div>
                                    </div>
                                `;
        }).join('')}
                        </div>
                    </aside>
                </div>

                <div class="psychosis-overlay ${isPsychosis ? 'active' : ''}">
                    <div class="voices-container">
                        ${Array(10).fill(0).map(() => `<div class="voice-text glitch-text" style="top:${Math.random() * 100}%; left:${Math.random() * 100}%;">ТЫ_ВИДИШЬ_НАС?</div>`).join('')}
                    </div>
                </div>

                <footer class="d-footer-v5">
                    <div class="footer-line"></div>
                    <div class="fh-item ds-label"><i data-lucide="heart"></i> HP: <span class="ds-value">${state.stats.health}%</span></div>
                </footer>
            </div>
        `;
    }

    static renderHeader(state) {
        return `
            <header class="d-header-v5">
                <div class="dh-left">
                    <div class="ds-label">КЛИНИКА "LAST HOPE" // Dr. VOGEL</div>
                    <h2 class="ds-heading ds-heading-md glitch-text" data-text="МЕДОТСЕК">МЕДОТСЕК</h2>
                </div>
            </header>
        `;
    }
}

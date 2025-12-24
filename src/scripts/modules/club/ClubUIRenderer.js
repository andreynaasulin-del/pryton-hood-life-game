/**
 * CLUB UI RENDERER - V5.0 (NEURO-HORROR REBOOT)
 * Vaporwave/Cyberpunk Studio with Diegetic Audio Visuals.
 */
export class ClubUIRenderer {
    static formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return (num || 0).toString();
    }

    static renderMain(activeSection, state, music, paths, kpis, season, self) {
        const musicState = music || { tracks: [], fame: 0 };
        const zefRep = state.npcs?.zef?.reputation || 0;

        return `
            <div class="club-layout-v5 ds-scanlines">
                ${this.renderHeader(musicState, paths)}
                
                <div class="c-main-row-v5">
                    <!-- 🎚️ SIDEBAR -->
                    <aside class="c-sidebar-v5">
                        <div class="tactical-module ds-panel-glass">
                            <div class="tm-header-v5">
                                <i data-lucide="layers"></i>
                                <span>ПРОДАКШН</span>
                            </div>
                            <div class="club-nav-v5">
                                <button class="c-nav-btn ${activeSection === 'studio' ? 'active' : ''}" data-section="studio">
                                    <i data-lucide="mic-2"></i> <span>СТУДИЯ</span>
                                </button>
                                <button class="c-nav-btn ${activeSection === 'charts' ? 'active' : ''}" data-section="charts">
                                    <i data-lucide="trending-up"></i> <span>ДИСКОГРАФИЯ</span>
                                </button>
                            </div>
                        </div>

                        <div class="zeph-status ds-panel-glass mt-3">
                            <div class="zs-label">ВЛАДЕЛЕЦ СТУДИИ: <span class="text-magenta">ЗЕФ</span></div>
                            <div class="zs-val">РЕПУТАЦИЯ: ${zefRep}%</div>
                            <div class="ia-text" style="font-size:0.6rem; opacity:0.6; margin-top:5px;">
                                ${zefRep > 50 ? 'СКИДКА НА БИТЫ: 20%' : 'АРЕНДА: ПОЛНАЯ СТОИМОСТЬ'}
                            </div>
                        </div>
                    </aside>

                    <!-- 🎛️ CONTENT -->
                    <main class="c-content-v5">
                        ${this.renderSection(activeSection, state, musicState, self)}
                    </main>
                </div>

                <div class="blood-overlay" id="ghostOverlay"></div>

                <footer class="c-footer-v5">
                    <div class="footer-line"></div>
                    <div class="footer-hud-v5">
                        <div class="fh-left"><span class="pulse-dot"></span> СТУДИЯ: NEON_VOID // LIVE_SIG</div>
                        <div class="fh-right">FAME_LVL: ${musicState.fame || 0}⭐</div>
                    </div>
                </footer>
            </div>
        `;
    }

    static renderHeader(music, paths) {
        return `
            <header class="c-header-v5">
                <div class="ch-left">
                    <div class="ch-tag">AUDIO_ENGINE // NEURAL_RECORDS</div>
                    <h2 class="ch-title-v5 glitch-text" data-text="СТУДИЯ ПРИТОНА">СТУДИЯ ПРИТОНА</h2>
                </div>
                <div class="club-stats-v5">
                    <div class="cs-item">
                        <label>ТРЕКОВ</label>
                        <span class="val">${music.tracks?.length || 0}</span>
                    </div>
                    <div class="cs-item">
                        <label>СЛАВА</label>
                        <span class="val">${music.fame || 0}⭐</span>
                    </div>
                </div>
            </header>
        `;
    }

    static renderSection(section, state, music, self) {
        switch (section) {
            case 'studio': return this.renderStudio(state, music, self);
            case 'charts': return this.renderCharts(music);
            default: return '';
        }
    }

    static renderStudio(state, music, self) {
        const selectedBeatId = music.currentBeat || null;
        const selectedTopicId = music.currentTopic || null;
        const selectedBeat = self.beats.find(b => b.id === selectedBeatId);
        const selectedTopic = self.topics.find(t => t.id === selectedTopicId);

        const canRecord = selectedBeat && selectedTopic && (state.stats?.energy || 0) >= 40;
        const ghostAvailable = (state.neuro?.ghostActive || false) || (state.stats?.stability < 40);

        // Equipment check
        const equipment = state.shop?.purchased || [];
        const bonuses = {
            mic: equipment.includes('mic_sm58'),
            laptop: equipment.includes('laptop_mac'),
            earbuds: equipment.includes('earbuds')
        };

        const rentalCost = selectedBeat ? Math.floor(selectedBeat.price * (state.npcs?.zef?.reputation > 50 ? 0.8 : 1)) : 0;

        return `
            <div class="studio-v5">
                <div class="viz-container ${self.isRecording ? 'recording' : ''}">
                    ${Array(40).fill(0).map(() => `<div class="viz-bar"></div>`).join('')}
                </div>

                <div class="studio-grid-v5">
                    <div class="studio-col">
                        <div class="col-hdr">БИТЫ // ИНСТРУМЕНТАЛ</div>
                        <div class="scroll-list-v5">
                            ${self.beats.map(beat => `
                                <div class="asset-card-v5 ${selectedBeatId === beat.id ? 'active' : ''}" data-beat="${beat.id}">
                                    <div class="ac-icon"><i data-lucide="${beat.icon}"></i></div>
                                    <div class="ac-body">
                                        <div class="ac-name">${beat.name.toUpperCase()}</div>
                                        <div class="ac-price">₽${beat.price.toLocaleString()}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="studio-col">
                        <div class="col-hdr">ТЕМЫ // ЛИРИКА</div>
                        <div class="scroll-list-v5">
                            ${self.topics.map(topic => `
                                <div class="asset-card-v5 ${selectedTopicId === topic.id ? 'active' : ''}" data-topic="${topic.id}">
                                    <div class="ac-icon"><i data-lucide="${topic.icon}"></i></div>
                                    <div class="ac-body">
                                        <div class="ac-name">${topic.name.toUpperCase()}</div>
                                        <div class="ac-desc">${topic.desc}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="record-controls ds-panel-glass">
                    <div class="equipment-icons">
                        <i data-lucide="mic" class="${bonuses.mic ? 'text-magenta' : 'disabled'}"></i>
                        <i data-lucide="laptop" class="${bonuses.laptop ? 'text-magenta' : 'disabled'}"></i>
                        <i data-lucide="headphones" class="${bonuses.earbuds ? 'text-magenta' : 'disabled'}"></i>
                    </div>

                    <div class="record-btns">
                        <button class="ds-btn-v2 ${canRecord ? 'primary' : 'disabled'}" id="recordTrackBtn">
                             ЗАПИСАТЬ ТРЕК
                        </button>
                        
                        ${ghostAvailable ? `
                            <button class="ds-btn-v2 ghost-btn" id="ghostInspirationBtn">
                                <i data-lucide="ghost"></i> ПРИЗВАТЬ ВДОХНОВЕНИЕ
                            </button>
                        ` : ''}
                    </div>

                    <div class="record-cost">
                        <div>ЭНЕРГИЯ: -40⚡</div>
                        <div>АРЕНДА: ₽${rentalCost}</div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderCharts(music) {
        const tracks = [...(music.tracks || [])].sort((a, b) => b.hype - a.hype);

        return `
            <div class="charts-module-v5">
                <div class="cm-header-v5">
                    <i data-lucide="disc"></i>
                    <span>КАССЕТЫ // ТВОИ ПРОЕКТЫ</span>
                </div>
                
                <div class="tracks-list-v5">
                    ${tracks.length > 0 ? tracks.map(t => `
                        <div class="track-cassette ds-panel-glass">
                            <div class="cassette-reels">
                                <div class="reel"></div>
                                <div class="reel"></div>
                            </div>
                            <div class="cassette-label">
                                <div class="cl-name">${t.name.toUpperCase()}</div>
                                <div class="cl-stats">
                                    QUALITY: ${t.quality}% | HYPE: ${Math.round(t.hype)}%
                                </div>
                                <div class="cl-income text-magenta">ROYALTY: ₽${Math.floor(t.quality * t.hype / 100)}/день</div>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-msg">НЕТ ЗАПИСАННЫХ ТРЕКОВ</div>'}
                </div>
            </div>
        `;
    }
}

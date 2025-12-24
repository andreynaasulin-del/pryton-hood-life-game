export class StreetUIRenderer {
    static renderMain(selectedDistrict, data, weather, timeOfDay, state, isWorking = false, activeJobId = null) {
        const district = data.districts[selectedDistrict];
        return `
            <div class="street-layout-v4 premium-tactical ds-scanlines">
                <!-- 📡 TACTICAL HUD HEADER -->
                <header class="s-header-v4">
                    <div class="sh-left">
                        <div class="sh-tag">КАНАЛ_НАБЛЮДЕНИЯ // СЕКТОР-X</div>
                        <h2 class="sh-title-v4 glitch-text" data-text="${district.title}">${district.title}</h2>
                        <div class="sh-subtitle">${district.subtitle}</div>
                    </div>
                    
                    <div class="sh-right">
                        <div class="tactical-env">
                            <div class="te-item">
                                <label>ОКРУЖ_СРЕДА</label>
                                <div class="te-val">
                                    <i data-lucide="cloud-rain"></i>
                                    <span>${weather.names[weather.current].toUpperCase()}</span>
                                </div>
                            </div>
                            <div class="te-item">
                                <label>УРОВЕНЬ_СВЕТА</label>
                                <div class="te-val">
                                    <i data-lucide="sun"></i>
                                    <span>${timeOfDay.name.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div class="s-main-row-v4">
                    <!-- 🗺️ SECTOR MAP (LEFT) -->
                    <div class="s-col-map-v4">
                        <div class="tactical-module map-module-v4 ds-panel-glass">
                            <div class="tm-header">
                                <i data-lucide="map"></i>
                                <span>ТОПОЛОГИЯ_СЕТИ</span>
                            </div>
                            <div class="city-map-v4">
                                <div class="map-grid-overlay"></div>
                                ${Object.values(data.districts).map(d => `
                                    <div class="map-node-v4 ${selectedDistrict === d.id ? 'active' : ''}" 
                                         data-district="${d.id}"
                                         style="top: ${d.mapY || 50}%; left: ${d.mapX || 50}%">
                                        <div class="node-core"></div>
                                        <div class="node-label-v4">${d.title}</div>
                                        <div class="node-ping"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="tactical-module intel-module-v4 ds-panel-glass">
                            <div class="tm-header">
                                <i data-lucide="info"></i>
                                <span>РАЗВЕДДАННЫЕ_СЕКТОРА</span>
                            </div>
                            <div class="intel-content">
                                <p class="intel-desc">${district.desc}</p>
                                <div class="intel-kpis">
                                    <div class="kpi-row">
                                        <div class="kpi-meta">
                                            <span class="kpi-label">УРОВЕНЬ_УГРОЗЫ</span>
                                            <span class="kpi-val">${district.danger}/5</span>
                                        </div>
                                        <div class="ds-progress ds-progress-danger">
                                            <div class="ds-progress-fill" style="width: ${district.danger * 20}%"></div>
                                        </div>
                                    </div>
                                    <div class="kpi-row">
                                        <div class="kpi-meta">
                                            <span class="kpi-label">ПЛОТНОСТЬ_НАСЕЛЕНИЯ</span>
                                            <span class="kpi-val">${district.population}/5</span>
                                        </div>
                                        <div class="ds-progress">
                                            <div class="ds-progress-fill" style="width: ${district.population * 20}%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ⚡ OPERATIONS (RIGHT) -->
                    <div class="s-col-actions-v4">
                        <div class="tactical-module actions-module-v4 ds-panel-glass">
                            <div class="tm-header">
                                <i data-lucide="zap"></i>
                                <span>ТАКТИЧЕСКИЕ_ОПЕРАЦИИ</span>
                            </div>
                            <div class="ops-list-v4 ${isWorking ? 'working-lock' : ''}">
                                ${district.jobs.map(j => {
            const canAfford = state.stats?.energy >= j.energy;
            const isActive = activeJobId === j.id;
            const isIllegal = j.type === 'illegal';

            return `
                                        <div class="op-card-v4 action-card job-card-v5 ${isIllegal ? 'mode-illegal' : ''} ${!canAfford ? 'disabled' : ''} ${isActive ? 'active-job' : ''}" 
                                             data-job="${j.id}">
                                            <div class="op-icon-v4">
                                                <i data-lucide="${j.icon || 'activity'}"></i>
                                            </div>
                                            <div class="op-details">
                                                <div class="op-name-v4 ${isIllegal ? 'glitch-text' : ''}" data-text="${j.title}">${j.title}</div>
                                                <div class="op-reward-v4">ОЖИД_ВЫПЛАТА: <span>₽${j.pay}</span></div>
                                                <div class="op-desc-v5">${j.desc}</div>
                                            </div>
                                            <div class="op-tactical">
                                                <div class="op-stat-row">
                                                    <span class="label">ЭНЕРГИЯ</span>
                                                    <span class="val ${!canAfford ? 'danger-text' : ''}">-${j.energy}</span>
                                                </div>
                                                ${isIllegal ? `
                                                    <div class="op-stat-row">
                                                        <span class="label">РИСК</span>
                                                        <span class="val warning-text">${(j.risk * 100).toFixed(0)}%</span>
                                                    </div>
                                                ` : ''}
                                                <div class="op-stat-row">
                                                    <span class="label">ВРЕМЯ</span>
                                                    <span class="val">${(j.duration / 1000).toFixed(0)}s</span>
                                                </div>
                                            </div>
                                            
                                            <!-- PROGRESS OVERLAY -->
                                            <div class="job-progress-overlay">
                                                <div class="job-progress-bar" id="progress-${j.id}" style="width: 0%"></div>
                                                <div class="job-progress-text">ВЫПОЛНЕНИЕ...</div>
                                            </div>

                                            <div class="op-hover-glow"></div>
                                            ${!canAfford ? '<div class="no-energy-overlay">НЕТ ЭНЕРГИИ</div>' : ''}
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 📟 TACTICAL FOOTER -->
                <footer class="s-footer-v4">
                    <div class="footer-line"></div>
                    <div class="footer-stats">
                        <div class="fs-item">
                            <span class="label">ЗАЩИТА:</span>
                            <span class="val green-text">ШИФРОВАНИЕ</span>
                        </div>
                        <div class="fs-item">
                            <span class="label">СИГНАЛ:</span>
                            <span class="val blue-text">СТАБИЛЬНЫЙ // 144.80 МГц</span>
                        </div>
                        <div class="fs-status">
                            <span class="pulse-dot"></span>
                            АКТИВНОЕ_СКАНИРОВАНИЕ
                        </div>
                    </div>
                </footer>
            </div>
        `;
    }
}

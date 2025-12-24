import { worldEngine } from '../WorldEngine.js';

/**
 * FARM UI RENDERER - V5.0 (BIO-INDUSTRIAL)
 */
export class FarmUIRenderer {
    static renderMain(state, data) {
        const farm = state.farm || { coins: 0, temp: 22, gpus: [], coolers: [] };
        const greenhouse = farm.greenhouse || { activeView: 'mining' };

        return `
            <div class="farm-layout-v5 ${greenhouse.activeView === 'greenhouse' ? 'view-greenhouse' : 'view-mining'} ds-scanlines">
                <div class="f-ambience-overlay"></div>
                ${this.renderHeader(farm)}
                
                <div class="f-view-toggle">
                    <button class="toggle-btn ${greenhouse.activeView === 'mining' ? 'active' : ''}" onclick="window.farmTab.switchView('mining')">СЕРВЕРНАЯ (MINING)</button>
                    <button class="toggle-btn ${greenhouse.activeView === 'greenhouse' ? 'active' : ''}" onclick="window.farmTab.switchView('greenhouse')"> СКРЫТАЯ ОРАНЖЕРЕЯ</button>
                </div>

                <div class="f-main-content">
                    ${greenhouse.activeView === 'mining' ? this.renderMiningView(farm, data) : this.renderGreenhouseView(farm, data)}
                </div>

                <!-- 🛒 MARKET OVERLAY -->
                <section class="f-market ds-panel-glass mt-3">
                    <div class="market-scroll">
                        ${greenhouse.activeView === 'mining' ? this.renderMiningMarket(data) : this.renderGreenhouseMarket(data, farm)}
                    </div>
                </section>
            </div>
        `;
    }

    static renderHeader(farm) {
        const gh = farm.greenhouse || {};
        const isGH = gh.activeView === 'greenhouse';
        return `
            <header class="f-header-v5">
                <div class="fh-left">
                    <div class="ds-label">${isGH ? 'BIO_RESEARCH // HIDDEN_SECTOR' : 'INDUSTRIAL_SECTOR // HUB_MINING'}</div>
                    <h2 class="ds-heading ds-heading-md glitch-text" data-text="${isGH ? 'ГРОУБОКС' : 'ФЕРМА'}">${isGH ? 'ГРОУБОКС' : 'ФЕРМА'}</h2>
                </div>
                <div class="fh-stats-bar">
                    ${isGH ? `
                        <div class="h-stat"><i data-lucide="wind"></i> <span class="ds-label">ЗАПАХ:</span> <span class="ds-value ${gh.smellLevel > 50 ? 'red' : 'cyan'}">${Math.floor(gh.smellLevel)}%</span></div>
                    ` : `
                        <div class="h-stat"><i data-lucide="thermometer"></i> <span class="ds-label">TEMP:</span> <span class="ds-value" style="color: ${this.getTempColor(farm.temp)}">${farm.temp.toFixed(1)}°C</span></div>
                        <div class="h-stat"><i data-lucide="database"></i> <span class="ds-value gold">${farm.coins.toFixed(4)} ₿</span></div>
                    `}
                </div>
            </header>
        `;
    }

    static renderMiningView(farm, data) {
        return `
            <div class="f-grid-two-col">
                <section class="f-dashboard ds-panel-glass">
                    <div class="stat-group">
                        <label>ОБМЕННИК</label>
                        <div class="val">1₿ = ₽${farm.cryptoRate}</div>
                        <button class="ds-btn-v2 special mt-2 w-100" onclick="window.farmTab.exchange()">ОБНАЛИЧИТЬ</button>
                    </div>
                    <div class="stat-group mt-3">
                        <label>ЭНЕРГОПОТРЕБЛЕНИЕ</label>
                        <div class="val">₽${(farm.gpus.length * 50).toLocaleString()}/час</div>
                    </div>
                </section>
                <section class="f-rack ds-panel-glass">
                    <div class="rack-grid">${this.renderMiningSlots(farm, data)}</div>
                </section>
            </div>
        `;
    }

    static renderGreenhouseView(farm, data) {
        const gh = farm.greenhouse;
        return `
            <div class="f-grid-greenhouse">
                <section class="gh-controls ds-panel-glass">
                    <div class="gh-stat-row">
                        <div class="label-box">
                            <label>ВЛАЖНОСТЬ</label>
                            <span>${Math.floor(gh.waterLevel)}%</span>
                        </div>
                        <div class="gh-progress-bg"><div class="gh-progress-fill water" style="width: ${gh.waterLevel}%"></div></div>
                        <button class="gh-icon-btn" onclick="window.farmTab.waterGreenhouse()"><i data-lucide="droplets"></i> ПОЛИТЬ</button>
                    </div>
                    <div class="gh-stat-row mt-3">
                        <div class="label-box">
                            <label>ОСВЕЩЕНИЕ</label>
                            <span>${Math.floor(gh.lightLevel)}%</span>
                        </div>
                        <div class="gh-progress-bg"><div class="gh-progress-fill light" style="width: ${gh.lightLevel}%"></div></div>
                        <button class="gh-icon-btn" onclick="window.farmTab.toggleLight()"><i data-lucide="sun"></i> ВКЛ/ВЫКЛ</button>
                    </div>
                </section>
                <section class="gh-slots-grid">
                    ${gh.slots.map((slot, i) => this.renderGreenhouseSlot(slot, i, data)).join('')}
                </section>
            </div>
        `;
    }

    static renderGreenhouseSlot(slot, index, data) {
        if (!slot.seedId) {
            return `
                <div class="empty-lure-slot greenhouse-lure" onclick="window.farmTab.buySeedModal(${index})">
                    <i data-lucide="leaf"></i>
                    <span class="lure-text">ГОТОВ К ПОСАДКЕ</span>
                    <div class="lure-btn-placeholder">ВЫБРАТЬ СЕМЕНА</div>
                </div>
            `;
        }
        const seed = data.seeds.find(s => s.id === slot.seedId);
        const isReady = slot.progress >= 100;
        return `
            <div class="gh-slot occupied ${isReady ? 'ready' : ''}">
                <div class="gh-plant-info">
                    <div class="p-name">${seed.name}</div>
                    <div class="p-progress">РОСТ: ${Math.floor(slot.progress)}%</div>
                </div>
                <div class="gh-plant-visual">
                    <div class="plant-sprite" style="opacity: ${0.2 + (slot.progress / 100) * 0.8}; transform: scale(${0.4 + (slot.progress / 100) * 0.6})"></div>
                </div>
                ${isReady ? `
                    <button class="gh-harvest-btn" onclick="window.farmTab.harvestSlot(${index})">СОБРАТЬ УРОЖАЙ</button>
                ` : `
                    <div class="gh-health-bar"><div class="fill" style="width: ${slot.health}%; background: ${slot.health < 30 ? '#ef4444' : '#22c55e'}"></div></div>
                `}
            </div>
        `;
    }

    static renderMiningMarket(data) {
        return `
            <div class="m-section">
                <label>ОБОРУДОВАНИЕ (GPUS/COOLERS)</label>
                <div class="m-grid">
                    ${data.gpus.map(g => {
            const price = worldEngine.getPrice(g.cost, 'gpus');
            const trend = worldEngine.getTrend('gpus');
            const trendIcon = trend === 'up' ? '<i data-lucide="trending-up" class="trend-up"></i>' :
                trend === 'down' ? '<i data-lucide="trending-down" class="trend-down"></i>' : '';
            return `
                            <div class="m-card" onclick="window.farmTab.buyGPU('${g.id}')">
                                <div class="m-name">${g.name} ${trendIcon}</div>
                                <div class="m-cost ${trend === 'up' ? 'text-red' : trend === 'down' ? 'text-green' : ''}">₽${price.toLocaleString()}</div>
                            </div>
                        `;
        }).join('')}
                    ${data.coolers.map(c => {
            const price = worldEngine.getPrice(c.cost, 'electronics');
            const trend = worldEngine.getTrend('electronics');
            const trendIcon = trend === 'up' ? '<i data-lucide="trending-up" class="trend-up"></i>' :
                trend === 'down' ? '<i data-lucide="trending-down" class="trend-down"></i>' : '';
            return `
                            <div class="m-card" onclick="window.farmTab.buyCooler('${c.id}')">
                                <div class="m-name">${c.name} ${trendIcon}</div>
                                <div class="m-stats">-${c.cooling}°C</div>
                                <div class="m-cost ${trend === 'up' ? 'text-red' : trend === 'down' ? 'text-green' : ''}">₽${price.toLocaleString()}</div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    static renderGreenhouseMarket(data, farm) {
        const gh = farm.greenhouse;
        return `
            <div class="m-section">
                <label>БИО-ИНЖЕНЕРИЯ (СЕМЕНА / АПГРЕЙДЫ)</label>
                <div class="m-grid">
                    ${data.seeds.map(s => {
            const price = worldEngine.getPrice(s.cost, 'electronics');
            const trend = worldEngine.getTrend('electronics');
            const trendIcon = trend === 'up' ? '<i data-lucide="trending-up" class="trend-up"></i>' :
                trend === 'down' ? '<i data-lucide="trending-down" class="trend-down"></i>' : '';
            return `
                            <div class="m-card seed" onclick="window.farmTab.buySeed('${s.id}')">
                                <div class="m-name">${s.name} ${trendIcon}</div>
                                <div class="m-cost ${trend === 'up' ? 'text-red' : trend === 'down' ? 'text-green' : ''}">₽${price.toLocaleString()}</div>
                            </div>
                        `;
        }).join('')}
                    <div class="m-card gear ${gh.carbonFilter ? 'owned' : ''}" onclick="window.farmTab.buyEquipment('carbon_filter')">
                        <div class="m-name">УГОЛЬНЫЙ ФИЛЬТР</div>
                        <div class="m-cost">${gh.carbonFilter ? 'УСТАНОВЛЕНО' : `₽${worldEngine.getPrice(25000, 'electronics').toLocaleString()}`}</div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderMiningSlots(farm, data) {
        let html = '';
        for (let i = 0; i < 8; i++) {
            const gpuId = farm.gpus[i];
            const gpu = gpuId ? data.gpus.find(g => g.id === gpuId) : null;
            if (gpu) {
                html += `
                    <div class="rack-slot occupied">
                        <div class="slot-gpu">
                            <div class="fan spinning"></div>
                            <div class="gpu-label ds-label">${gpu.name.toUpperCase()}</div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="empty-lure-slot mining-lure" onclick="window.farmTab.scrollToMarket()">
                        <i data-lucide="cpu"></i>
                        <span class="lure-text">СЛОТ СВОБОДЕН</span>
                        <div class="lure-btn-placeholder">КУПИТЬ GPU</div>
                    </div>
                `;
            }
        }
        return html;
    }

    static getTempColor(temp) {
        if (temp < 60) return '#22c55e';
        if (temp < 85) return '#eab308';
        return '#ef4444';
    }

    static renderOfflineModal(result) {
        return `
            <div class="offline-report industrial-tech">
                <div class="or-header text-green">ОТЧЕТ ПОСЛЕ ПАУЗЫ</div>
                <div class="or-body">
                    <p>Добыто: <span class="gold-text">${result.mined.toFixed(6)} ₿</span></p>
                    <p>Расходы на свет: <span class="text-red">₽${result.electricity.toFixed(0)}</span></p>
                    ${result.burntCard ? `<p class="text-red">ВНИМАНИЕ: Сгорела карта ${result.burntCard}!</p>` : ''}
                </div>
                <button class="ds-btn-v2 primary w-100 mt-3" onclick="window.uiManager.hideModal()">ПРИНЯТЬ</button>
            </div>
        `;
    }
}

/**
 * SHOP UI RENDERER - V5.0 (NEURO-HORROR REBOOT)
 * Tactical Darknet Market with Stability-Reactive Interface.
 */
import { ITEMS } from '../../data/items.js';
import { worldEngine } from '../WorldEngine.js';

export class ShopUIRenderer {
    static renderMain(state, activeCategory, mode) {
        const cash = Math.floor(state.kpis?.cash || 0);
        const stability = state.neuro?.stability || 100;
        const isUnstable = stability < 30;

        return `
            <div class="shadow-shop-v5 ds-scanlines ${isUnstable ? 'neuro-glitch-active' : ''}">
                ${this.renderTacticalHeader(cash)}

                <div class="s-main-row-v5">
                    <!-- 🛠️ TRADING MODES (LEFT) -->
                    <aside class="s-sidebar-v5">
                        <div class="tactical-module ds-panel-glass">
                            <div class="tm-header-v5">
                                <i data-lucide="layers"></i>
                                <span>РЕЖИМЫ_СЕТИ</span>
                            </div>
                            <div class="mode-btns-v5">
                                <button class="ds-btn-v2 mode-switch ${mode === 'buy' ? 'active' : ''}" data-mode="buy">
                                    <i data-lucide="shopping-cart"></i> КУПИТЬ
                                </button>
                                <button class="ds-btn-v2 mode-switch ${mode === 'sell' ? 'active' : ''}" data-mode="sell">
                                    <i data-lucide="banknote"></i> ПРОДАТЬ
                                </button>
                            </div>
                        </div>

                        ${mode === 'buy' ? this.renderCategoryNav(activeCategory) : ''}
                    </aside>

                    <!-- 📦 ITEM LIST (CENTER) -->
                    <main class="s-content-v5">
                        <div class="tactical-module ds-panel-glass">
                            <div class="tm-header-v5">
                                <i data-lucide="package"></i>
                                <span>МАНИФЕСТ :: ${activeCategory.toUpperCase()}</span>
                            </div>
                            <div class="items-grid-v5">
                                ${mode === 'buy' ? this.renderBuyItems(state, activeCategory, isUnstable) : this.renderSellItems(state)}
                            </div>
                        </div>
                    </main>

                    <!-- 📊 INTEL (RIGHT) -->
                    <aside class="s-intel-v5">
                        <div class="tactical-module ds-panel-glass intel-box">
                            <div class="tm-header-v5">
                                <i data-lucide="info"></i>
                                <span>РАЗВЕДКА_РЫНКА</span>
                            </div>
                            <div class="intel-text-v5">
                                ${isUnstable
                ? '<p class="glitch-text" data-text="ОНО ЖДЕТ ТЕБЯ ЗА ПРИЛАВКОМ">ОНО ЖДЕТ ТЕБЯ ЗА ПРИЛАВКОМ</p>'
                : '<p>Всё имеет цену. Анонимность стоит дороже всего.</p>'}
                                <div class="intel-alert-v5 ${isUnstable ? 'alert-danger' : ''}">
                                    <div class="ia-tag">СТАТУС</div>
                                    <div class="ia-text">${isUnstable ? 'КАНАЛ ПЕРЕХВАЧЕН' : 'ШИФРОВАНИЕ АКТИВНО'}</div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                <footer class="s-footer-v5">
                    <div class="footer-line"></div>
                    <div class="footer-hud-v5">
                        <div class="fh-left"><span class="pulse-dot"></span> СЕРВЕР: STP_OS//DOMINION</div>
                        <div class="fh-right">STABILITY_LVL: ${stability}%</div>
                    </div>
                </footer>
            </div>
        `;
    }

    static renderTacticalHeader(cash) {
        return `
            <header class="s-header-v5">
                <div class="sh-left">
                    <div class="ds-label">DARKNET_MARKET // SECURE_HUB</div>
                    <h2 class="ds-heading ds-heading-lg glitch-text" data-text="ТЕНЕВОЙ РЫНОК">ТЕНЕВОЙ РЫНОК</h2>
                </div>
                <div class="sh-right">
                    <div class="tactical-wallet">
                        <div class="ds-label">БАЛАНС_КРИПТО</div>
                        <div class="ds-value gold" style="font-size: 1.6rem">${cash.toLocaleString()} ₽</div>
                    </div>
                </div>
            </header>
        `;
    }

    static renderCategoryNav(activeCategory) {
        const categories = [
            { id: 'street', icon: 'zap', label: 'УЛИЦА' },
            { id: 'pharma', icon: 'pill', label: 'АПТЕКА' },
            { id: 'studio', icon: 'mic-2', label: 'СТУДИЯ' },
            { id: 'black', icon: 'skull', label: 'DARKNET' }
        ];

        return `
            <div class="tactical-module ds-panel-glass mt-3">
                <div class="tm-header-v5">
                    <i data-lucide="filter"></i>
                    <span>ФИЛЬТР_ТОВАРОВ</span>
                </div>
                <div class="cat-btns-v5">
                    ${categories.map(c => `
                        <button class="cat-pill cat-btn ${activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
                            <i data-lucide="${c.icon}"></i> ${c.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static renderBuyItems(state, activeCategory, isUnstable) {
        const items = ITEMS.filter(i => i.category === activeCategory);
        const cash = state.kpis?.cash || 0;
        const purchased = state.shop?.purchased || [];

        if (items.length === 0) return '<div class="no-items">МАНИФЕСТ ПУСТ</div>';

        return items.map(item => {
            // Apply World Economy
            const currentPrice = worldEngine.getPrice(item.price, item.category === 'pharma' ? 'pharma' : 'electronics');
            const trend = worldEngine.getTrend(item.category === 'pharma' ? 'pharma' : 'electronics');
            const trendIcon = trend === 'up' ? '<i data-lucide="trending-up" class="trend-up"></i>' :
                trend === 'down' ? '<i data-lucide="trending-down" class="trend-down"></i>' : '';

            const canAfford = cash >= currentPrice;
            const isOwned = !item.consumable && purchased.includes(item.id);
            const isIllegal = item.category === 'black' || item.tier === 'legendary';

            // NEURO-INFLATION LOGIC
            let displayPrice = `${currentPrice.toLocaleString()} ₽`;
            let displayDesc = item.desc;

            if (isUnstable) {
                // Glitch the price
                if (Math.random() > 0.5) {
                    displayPrice = `0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`;
                }
                // Eerie descriptions for pharma
                if (item.category === 'pharma') {
                    const scaryMsgs = [
                        'Оно не поможет тебе забыть.',
                        'Твой пульс замедляется.',
                        'Я вижу тебя насквозь.',
                        'Глотай, пока можешь.'
                    ];
                    displayDesc = scaryMsgs[Math.floor(Math.random() * scaryMsgs.length)];
                } else if (Math.random() > 0.7) {
                    displayDesc = "ТЫ ПОТЕРЯЛ СЕБЯ В ПАУТИНЕ ДАННЫХ.";
                }
            }

            return `
                <div class="item-card-v5 ds-panel-glass ${item.tier || 'common'} ${isIllegal ? 'illegal-item' : ''} ${isOwned ? 'owned' : ''}">
                    <div class="ic-header-v5">
                        <div class="ic-icon"><i data-lucide="${item.icon || 'package'}"></i></div>
                        <div class="ic-tier">
                            ${(item.tier || 'common').toUpperCase()}
                            ${trendIcon}
                        </div>
                    </div>
                    <div class="ic-body-v5">
                        <div class="ic-name ds-heading-sm ${isUnstable ? 'glitch-text' : ''}" data-text="${item.name}">${item.name.toUpperCase()}</div>
                        <div class="ic-desc">${displayDesc}</div>
                        <div class="ic-effect ds-label" style="color: var(--accent-green); opacity: 1">${item.effectText || ''}</div>
                    </div>
                    <div class="ic-footer-v5">
                        <div class="ic-price ds-value ${trend === 'up' ? 'red' : trend === 'down' ? 'cyan' : ''} ${isUnstable ? 'shake-text' : ''}">${displayPrice}</div>
                        <button class="ds-btn-v2 buy-btn ${!canAfford || isOwned ? 'disabled' : 'primary'}" 
                                data-id="${item.id}" 
                                ${(!canAfford || isOwned) ? 'disabled' : ''}>
                            ${isOwned ? 'ВЛАДЕЕТЕ' : canAfford ? 'КУПИТЬ' : 'БЛОК'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    static renderSellItems(state) {
        const inventory = state.inventory || [];
        if (inventory.length === 0) return '<div class="empty-inv">ИНВЕНТАРЬ ПУСТ</div>';

        return inventory.map((item, index) => {
            const sellPrice = Math.floor((item.price || 100) * 0.4);
            return `
                <div class="item-card-v5 ds-panel-glass legacy-sell">
                    <div class="ic-header-v5">
                        <div class="ic-icon"><i data-lucide="${item.icon || 'box'}"></i></div>
                        <div class="ic-tier">ЛИКВИДАЦИЯ</div>
                    </div>
                    <div class="ic-body-v5">
                        <div class="ic-name">${item.name.toUpperCase()}</div>
                        <div class="ic-desc">Перепродажа на вторичном рынке.</div>
                    </div>
                    <div class="ic-footer-v5">
                        <div class="ic-price">${sellPrice.toLocaleString()} ₽</div>
                        <button class="ds-btn-v2 sell-btn" data-index="${index}" data-price="${sellPrice}">
                            ПРОДАТЬ
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

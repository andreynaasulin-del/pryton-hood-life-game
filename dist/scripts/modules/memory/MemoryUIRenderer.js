/**
 * MEMORY UI RENDERER - V5.0 (HEX ARCHIVE)
 */
export class MemoryUIRenderer {
    static renderMain(state, self, shardsData) {
        const neuro = state.neuro || {};
        const collectedShards = neuro.shards || [];
        const selectedShard = shardsData.find(s => s.id === self.selectedShardId);
        const ownedShardState = collectedShards.find(s => s.id === self.selectedShardId);

        return `
            <div class="memory-layout-v5 ds-scanlines">
                <div class="memory-bg-stream"></div>
                ${this.renderHeader()}
                
                <div class="m-grid-v5">
                    <!-- 🗄️ SHARD EXPLORER -->
                    <aside class="shard-explorer-v5">
                        <div class="se-header">ОБНАРУЖЕННЫЕ_ОСКОЛКИ: ${collectedShards.length}</div>
                        <div class="shard-list-scroll">
                            ${collectedShards.map(s => {
            const data = shardsData.find(sd => sd.id === s.id);
            if (!data) return '';
            return `
                                    <div class="shard-node ${self.selectedShardId === s.id ? 'active' : ''} ${!s.decrypted ? 'locked' : ''}" 
                                         onclick="window.memoryTab.selectShard('${s.id}')">
                                        <div class="sn-info">${data.title}</div>
                                        <div class="sn-type">${data.type} // ${s.decrypted ? 'DECRYPTED' : 'ENCRYPTED'}</div>
                                    </div>
                                `;
        }).join('')}
                            ${collectedShards.length === 0 ? '<div class="empty-msg">АРХИВ ПУСТ. ИЩИ ОСКОЛКИ НА УЛИЦЕ.</div>' : ''}
                        </div>
                    </aside>

                    <!-- 🖥️ DATA CONTENT -->
                    <main class="m-content-v5">
                        <div class="hex-display-box ds-panel-glass">
                            ${this.renderContent(selectedShard, ownedShardState, self)}
                        </div>
                    </main>
                </div>
            </div>
        `;
    }

    static renderContent(shard, state, self) {
        if (!shard) return '<div class="matrix-text">ВЫБЕРИТЕ_ФАЙЛ_ДЛЯ_АНАЛИЗА...</div>';

        if (self.isDecrypting && self.selectedShardId === shard.id) {
            return `
                <div class="decryption-overlay">
                    <div class="matrix-text">ДЕШИФРОВКА_ПОТОКА...</div>
                    <div class="decode-progress-bar">
                        <div class="dpb-fill" style="width: ${self.decryptProgress}%"></div>
                    </div>
                </div>
            `;
        }

        if (state && state.decrypted) {
            return `
                <div class="lore-content">
                    <div class="lore-header">${shard.title}</div>
                    <div class="lore-body">${shard.content}</div>
                </div>
            `;
        }

        return `
            <div class="encrypted-placeholder">
                <div class="matrix-text">ДАННЫЕ_ЗАШИФРОВАНЫ</div>
                <button class="ds-btn-v2 primary mt-3" onclick="window.memoryTab.startDecryption('${shard.id}')">
                    ЗАПУСТИТЬ_ДЕШИФРАТОР
                </button>
            </div>
        `;
    }

    static renderHeader() {
        return `
            <header class="m-header-v5">
                <div class="mh-left">
                    <div class="mh-tag">NEURAL_DECODER // PRYTON_ARCHIVE</div>
                    <h2 class="mh-title-v5 glitch-text" data-text="ПАМЯТЬ">ПАМЯТЬ</h2>
                </div>
            </header>
        `;
    }
}

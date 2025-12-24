import { gameState } from '../game-state.js';
import { MemoryUIRenderer } from '../memory/MemoryUIRenderer.js';
import { SHARDS_DATA } from '../../data/ShardsData.js';
import { audioSystem } from '../audio-system.js';

/**
 * MEMORY TAB - V5.0 (PLOT ARCHIVE)
 */
export class MemoryTab {
    constructor(uiManager) {
        this.ui = uiManager;
        this.selectedShardId = null;
        this.isDecrypting = false;
        this.decryptProgress = 0;
        this.decryptInterval = null;
        this._container = null;

        window.memoryTab = this;
    }

    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="memory"]');
        }
        return this._container;
    }

    init() {
        if (this.container) {
            this.container.classList.add('memory-active');
            this.render();
            this.startMatrixRain();
        }
    }

    destroy() {
        if (this.decryptInterval) clearInterval(this.decryptInterval);
        if (this.container) {
            this.container.classList.remove('memory-active');
        }
        this._container = null;
    }

    render() {
        if (!this.container) return;
        const state = gameState.getState();
        this.container.innerHTML = MemoryUIRenderer.renderMain(state, this, SHARDS_DATA);
        if (window.lucide) window.lucide.createIcons();
    }

    selectShard(id) {
        if (this.isDecrypting) return;
        this.selectedShardId = id;
        audioSystem.playTabSwitch();
        this.render();
    }

    startDecryption(id) {
        const shard = SHARDS_DATA.find(s => s.id === id);
        if (!shard || this.isDecrypting) return;

        this.isDecrypting = true;
        this.decryptProgress = 0;
        this.selectedShardId = id;

        const duration = shard.decryptionDuration * 1000;
        const step = 100; // Update every 100ms
        const increment = (step / duration) * 100;

        audioSystem.playGlitch();
        this.render();

        this.decryptInterval = setInterval(() => {
            this.decryptProgress += increment;
            if (this.decryptProgress >= 100) {
                clearInterval(this.decryptInterval);
                this.completeDecryption(id);
            } else {
                this.updateProgressUI();
            }
        }, step);
    }

    updateProgressUI() {
        const fill = this.container.querySelector('.dpb-fill');
        if (fill) fill.style.width = `${this.decryptProgress}%`;
    }

    completeDecryption(id) {
        this.isDecrypting = false;
        this.decryptProgress = 0;

        const state = gameState.getState();
        const shardInState = state.neuro.shards.find(s => s.id === id);
        if (shardInState) {
            shardInState.decrypted = true;
        }

        gameState.updateKPI('fame', 5); // Decryption reward
        gameState.addLogEntry(`ФАЙЛ ДЕШИФРОВАН: Поток данных восстановлен.`, 'good');
        audioSystem.playSuccess();
        this.render();
    }

    startMatrixRain() {
        const container = this.container;
        if (!container) return;

        // Simple Matrix rain simulation
        const chars = "01010101 ABCDEF HIJKLMNOPQRSTUVWXYZ";
        setInterval(() => {
            if (this.ui.currentTab !== 'memory') return;
            const drop = document.createElement('div');
            drop.className = 'matrix-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.duration = Math.random() * 3 + 2 + 's';
            drop.textContent = chars[Math.floor(Math.random() * chars.length)];
            container.appendChild(drop);
            setTimeout(() => drop.remove(), 5000);
        }, 300);
    }
}

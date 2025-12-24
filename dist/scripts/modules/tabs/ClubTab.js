import { gameState } from '../game-state.js';
import { ClubData } from '../club/ClubData.js';
import { ClubUIRenderer } from '../club/ClubUIRenderer.js';
import { audioSystem } from '../audio-system.js';
import { visualFXManager } from '../VisualFXManager.js';
import { neuroNarrator } from '../NeuroNarrator.js';

/**
 * CLUB TAB - V5.0 (NEON UNDERGROUND STUDIO)
 */
export class ClubTab {
    constructor(uiManager) {
        this.ui = uiManager;
        this.activeSection = 'studio';

        // Data from ClubData
        this.beats = ClubData.beats;
        this.topics = ClubData.topics;

        // Internal State
        this.isRecording = false;
        this._container = null;
    }

    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="club"]');
        }
        return this._container;
    }

    init() {
        if (this.container) {
            this.container.classList.add('neon-studio-active', 'ds-scanlines');
        }
        this.render();
    }

    destroy() {
        if (this.container) {
            this.container.classList.remove('neon-studio-active', 'ds-scanlines');
        }
        this._container = null;
    }

    render() {
        if (!this.container) return;

        const state = gameState.getState();
        const music = state.music || { tracks: [], fame: 0 };
        const paths = state.paths || { music: 0 };
        const kpis = state.kpis || { cash: 0 };

        this.container.innerHTML = ClubUIRenderer.renderMain(
            this.activeSection,
            state,
            music,
            paths,
            kpis,
            null,
            this
        );

        this.bindEvents();
        if (window.lucide) window.lucide.createIcons();
    }

    bindEvents() {
        const container = this.container;
        if (!container) return;

        // Tab navigation
        container.querySelectorAll('.c-nav-btn').forEach(btn => {
            btn.onclick = () => {
                this.activeSection = btn.dataset.section;
                audioSystem.playTabSwitch();
                this.render();
            };
        });

        // Beat selection
        container.querySelectorAll('.asset-card-v5[data-beat]').forEach(card => {
            card.onclick = () => {
                const s = gameState.getState();
                if (!s.music) s.music = { tracks: [] };
                s.music.currentBeat = card.dataset.beat;
                audioSystem.playTabSwitch();
                this.render();
            };
        });

        // Topic selection
        container.querySelectorAll('.asset-card-v5[data-topic]').forEach(card => {
            card.onclick = () => {
                const s = gameState.getState();
                if (!s.music) s.music = { tracks: [] };
                s.music.currentTopic = card.dataset.topic;
                audioSystem.playTabSwitch();
                this.render();
            };
        });

        // Action Buttons
        const recordBtn = container.querySelector('#recordTrackBtn');
        if (recordBtn && !recordBtn.classList.contains('disabled')) {
            recordBtn.onclick = () => this.handleRecord();
        }

        const ghostBtn = container.querySelector('#ghostInspirationBtn');
        if (ghostBtn) {
            ghostBtn.onclick = () => this.handleGhostInvocation();
        }
    }

    handleRecord() {
        if (this.isRecording) return;

        const state = gameState.getState();
        const music = state.music || {};
        const beat = this.beats.find(b => b.id === music.currentBeat);

        if (!beat) return;

        const rentalCost = Math.floor(beat.price * (state.npcs?.zef?.reputation > 50 ? 0.8 : 1));

        if (state.kpis.cash < rentalCost) {
            this.ui?.showToast('НУЖЕН КЭШ НА АРЕНДУ', 'error');
            audioSystem.playError();
            return;
        }

        if (state.stats.energy < 40) {
            this.ui?.showToast('ТЫ СЛИШКОМ УСТАЛ', 'error');
            audioSystem.playError();
            return;
        }

        this.startRecordingProcess(rentalCost, false);
    }

    handleGhostInvocation() {
        if (this.isRecording) return;

        const state = gameState.getState();
        const music = state.music || {};
        const beat = this.beats.find(b => b.id === music.currentBeat);

        if (!beat) {
            this.ui?.showToast('СНАЧАЛА ВЫБЕРИ БИТ', 'error');
            return;
        }

        const rentalCost = Math.floor(beat.price * (state.npcs?.zef?.reputation > 50 ? 0.8 : 1));

        // Ghost Price: Health and Stability
        if (state.stats.health < 25 || state.neuro.stability < 35) {
            this.ui?.showToast('ТВОЁ ТЕЛО НЕ ВЫДЕРЖИТ ЭТОГО', 'error');
            audioSystem.playError();
            return;
        }

        // Visual Horror Effect
        const overlay = document.getElementById('ghostOverlay');
        if (overlay) overlay.classList.add('active');

        visualFXManager.triggerFlash(0.5);
        visualFXManager.triggerScreenShake(1000);
        audioSystem.playGlitch();
        neuroNarrator.showMessage("Я ВЛОЖИЛ В ЭТИ СТРОКИ ТВОЮ БОЛЬ.");

        setTimeout(() => {
            if (overlay) overlay.classList.remove('active');
        }, 2000);

        // Deduct Ghost price
        gameState.updateStat('health', -20);
        gameState.updateNeuro('stability', -30);

        this.startRecordingProcess(rentalCost, true);
    }

    startRecordingProcess(cost, isGhost) {
        this.isRecording = true;
        this.render();

        audioSystem.playTabSwitch(); // Start sound

        setTimeout(() => {
            this.isRecording = false;
            this.finalizeTrack(cost, isGhost);
        }, 3000);
    }

    finalizeTrack(cost, isGhost) {
        const state = gameState.getState();
        const music = state.music;
        const beat = this.beats.find(b => b.id === music.currentBeat);
        const topic = this.topics.find(t => t.id === music.currentTopic);

        // Equipment bonuses
        const equipment = state.shop?.purchased || [];
        let equipBonus = 0;
        if (equipment.includes('mic_sm58')) equipBonus += 15;
        if (equipment.includes('laptop_mac')) equipBonus += 10;
        if (equipment.includes('earbuds')) equipBonus += 5;

        // Quality Calculation
        let quality = 0;
        if (isGhost) {
            quality = 85 + Math.floor(Math.random() * 15); // Hit guaranteed
        } else {
            const base = 40 + Math.floor(Math.random() * 40);
            quality = Math.min(100, base + equipBonus);
        }

        const trackName = `${topic.name} // ${beat.name}`;

        const newTrack = {
            id: `track_${Date.now()}`,
            name: trackName,
            quality: quality,
            hype: 100, // Starts at 100%
            dayCreated: state.day
        };

        // Update State
        music.tracks.push(newTrack);
        music.currentBeat = null;
        music.currentTopic = null;
        music.fame = (music.fame || 0) + Math.floor(quality / 5);

        gameState.updateKPI('cash', -cost);
        gameState.updateStat('energy', -40);
        gameState.updatePath('music', quality / 10);

        gameState.addLogEntry(`ЗАПИСАН ${isGhost ? 'ХИТ' : 'ТРЕК'}: ${trackName} (${quality}%)`, isGhost ? 'special' : 'good');
        this.ui?.showToast(`🎵 ТРЕК ГОТОВ: ${quality}% КАЧЕСТВА`);

        audioSystem.playCashRegister();
        this.render();
    }
}

export default ClubTab;

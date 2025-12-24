import { gameState } from '../game-state.js';
import { SHARDS_DATA } from '../../data/ShardsData.js';
import seasonSystem from '../season-system.js';
import { StreetData } from '../street/StreetData.js';
import { StreetUIRenderer } from '../street/StreetUIRenderer.js';
import { audioSystem } from '../audio-system.js';
import { visualFXManager } from '../VisualFXManager.js';
import { neuroNarrator } from '../NeuroNarrator.js';

export class StreetTab {
    constructor(uiManager) {
        this.ui = uiManager;
        this.selectedDistrict = 'slums';
        this.weather = StreetData.weather;
        this.weather.current = 'clear';

        // Job State
        this.isWorking = false;
        this.activeJobId = null;
        this.jobTimer = null;

        // DOM Cache
        this._container = null;
    }

    get container() {
        if (!this._container) {
            this._container = document.querySelector('.view[data-view="street"]');
        }
        return this._container;
    }

    init() {
        this.updateWeather();
        this.render();
    }

    destroy() {
        if (this.jobTimer) clearInterval(this.jobTimer);
        this._container = null;
    }

    updateWeather() {
        const state = gameState.getState();
        const season = seasonSystem.getSeasonByDay(state.day || 1);
        if (season.id === 'winter') this.weather.current = Math.random() > 0.5 ? 'snow' : 'clear';
        else this.weather.current = this.weather.types[Math.floor(Math.random() * this.weather.types.length)];
    }

    render() {
        if (!this.container) return;

        const state = gameState.getState();
        this.container.innerHTML = StreetUIRenderer.renderMain(
            this.selectedDistrict,
            StreetData,
            this.weather,
            this.getTimeOfDay(),
            state,
            this.isWorking,
            this.activeJobId
        );

        this.bindEvents();
        if (window.lucide) window.lucide.createIcons();
    }

    getTimeOfDay() {
        const hour = gameState.getState().time?.hour || 12;
        if (hour >= 6 && hour < 12) return { name: 'Утро', icon: '🌅' };
        if (hour >= 12 && hour < 18) return { name: 'День', icon: '☀️' };
        if (hour >= 18 && hour < 22) return { name: 'Вечер', icon: '🌆' };
        return { name: 'Ночь', icon: '🌙' };
    }

    bindEvents() {
        const container = this.container;
        if (!container) return;

        container.querySelectorAll('.map-node-v4').forEach(marker => {
            marker.onclick = () => {
                if (this.isWorking) return;
                this.selectedDistrict = marker.dataset.district;
                this.render();
            };
        });

        container.querySelectorAll('.job-card-v5').forEach(card => {
            card.onclick = () => this.handleJobStart(card.dataset.job);
        });
    }

    handleJobStart(jobId) {
        if (this.isWorking) return;

        const district = StreetData.districts[this.selectedDistrict];
        const job = district.jobs.find(j => j.id === jobId);

        if (gameState.getState().stats.energy < job.energy) {
            this.ui?.showToast('Не хватает энергии!', 'error');
            audioSystem.playError();
            return;
        }

        this.isWorking = true;
        this.activeJobId = jobId;
        this.render();

        let elapsed = 0;
        const interval = 100; // ms
        const total = job.duration;

        this.jobTimer = setInterval(() => {
            elapsed += interval;
            const percent = (elapsed / total) * 100;
            this.updateProgress(jobId, percent);

            if (elapsed >= total) {
                clearInterval(this.jobTimer);
                this.completeJob(job);
            }
        }, interval);

        audioSystem.playTabSwitch(); // Using as a "start job" sound for now
    }

    updateProgress(jobId, percent) {
        const bar = document.getElementById(`progress-${jobId}`);
        if (bar) bar.style.width = `${percent}%`;
    }

    completeJob(job) {
        this.isWorking = false;
        this.activeJobId = null;

        // Risk Check for illegal jobs
        if (job.type === 'illegal' && Math.random() < job.risk) {
            this.triggerRaid();
            this.render();
            return;
        }

        const state = gameState.getState();
        const implants = state.neuro?.implants || [];
        let payBonus = 0;

        if (implants.includes('synapse_booster')) {
            payBonus = Math.floor(job.pay * 0.15);
        }

        gameState.updateState({
            kpis: { ...state.kpis, cash: state.kpis.cash + job.pay + payBonus },
            stats: {
                ...state.stats,
                energy: Math.max(0, state.stats.energy - job.energy),
                mood: Math.max(0, state.stats.mood - (job.stress / 2))
            },
            neuro: { ...state.neuro, stability: Math.max(0, state.neuro.stability - job.stress) }
        });

        if (payBonus > 0) {
            gameState.addLogEntry(`БУСТЕР: Дополнительный доход +₽${payBonus}`, 'good');
        }

        // Data Shard Discovery (10% chance)
        if (Math.random() < 0.10) {
            const randomShard = SHARDS_DATA[Math.floor(Math.random() * SHARDS_DATA.length)];
            const owned = state.neuro?.shards || [];
            if (!owned.some(s => s.id === randomShard.id)) {
                owned.push({ id: randomShard.id, decrypted: false, progress: 0 });
                gameState.updateState({ neuro: { ...state.neuro, shards: owned } });
                gameState.addLogEntry('ТЕБЕ ПОВЕЗЛО: Найден зашифрованный дата-осколок!', 'special');
                audioSystem.playGlitch();
            }
        }

        gameState.advanceTime(Math.floor(job.duration / 60000) * 10 || 15);

        this.ui?.showToast(`Выполнено: ${job.title}! +₽${job.pay}`, 'success');
        audioSystem.playCashRegister();

        if (job.stress > 20) {
            neuroNarrator.showMessage("ТВОИ РУКИ ДРОЖАТ. МНЕ ЭТО НРАВИТСЯ.");
        }

        this.render();
    }

    triggerRaid() {
        const state = gameState.getState();
        const implants = state.neuro?.implants || [];

        let damage = 20;
        const fine = 500;

        // Sub-dermal Armor perk
        if (implants.includes('subdermal_armor')) {
            damage = Math.floor(damage * 0.8);
            gameState.addLogEntry('БРОНЯ ПОГЛОТИЛА ЧАСТЬ УРОНА.', 'good');
        }

        gameState.updateStat('health', -damage);
        gameState.updateKPI('cash', -fine);

        visualFXManager.triggerScreenShake(800);
        this.ui?.showToast('ОБЛАВА! Тебя приняли.', 'error');
        audioSystem.playError();

        // Lockdown Integration
        if (window.uiManager && window.uiManager.tabs.prison) {
            window.uiManager.tabs.prison.arrest(300); // 5 minutes
        }

        neuroNarrator.showMessage("БЕГИ, ПОКА НЕ ПОЗДНО. УЖЕ СЛИШКОМ ПОЗДНО.");
    }
}

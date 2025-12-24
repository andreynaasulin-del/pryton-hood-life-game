import { INITIAL_STATE } from '../data/initial-state.js';
import { logger } from './logger.js';
import { FARM_DATA } from '../data/FarmData.js';
import { worldEngine } from './WorldEngine.js';

/**
 * GAME STATE - Центральное хранилище состояния игры
 * ОПТИМИЗИРОВАН: batch updates, улучшенный deep merge
 */
class GameState {
  constructor() {
    this.listeners = new Map();
    this._pendingEmits = [];
    this._emitBatchTimeout = null;
    this.reset();
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    // Ensure neuro state is present
    if (!this.state.neuro) {
      this.state.neuro = {
        stability: 100,
        maxStability: 100,
        modernization: 0,
        artifacts: [],
        implants: [],
        shards: []
      };
    }
    // Music System Init
    if (!this.state.music) {
      this.state.music = { tracks: [], currentBeat: null, currentTopic: null, fame: 0 };
    }
    // NPC System Init
    if (!this.state.npcs) {
      this.state.npcs = { zef: { reputation: 10 } };
    }
    // Farm System Init
    if (!this.state.farm) {
      this.state.farm = { lastSync: Date.now(), coins: 0, temp: 22, cryptoRate: 100, gpus: [], coolers: [] };
    }
    this.emit('reset', this.state);
    logger.info('[GameState] Состояние сброшено к истокам');
  }

  // --- Observer Pattern ---
  subscribe(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  /**
   * Emit event to listeners
   * @param {string} event 
   * @param {any} data 
   * @param {boolean} immediate - bypass batching for critical events
   */
  emit(event, data, immediate = false) {
    if (immediate || event === 'reset' || event === 'load') {
      // Immediate emit for critical events
      this._doEmit(event, data);
    } else {
      // Batch non-critical events
      this._pendingEmits.push({ event, data });
      this._scheduleBatchEmit();
    }
  }

  _doEmit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { logger.error(`[GameState] Listener error:`, e); }
      });
    }
  }

  _scheduleBatchEmit() {
    if (this._emitBatchTimeout) return;

    this._emitBatchTimeout = requestAnimationFrame(() => {
      // Process all pending emits
      const emits = [...this._pendingEmits];
      this._pendingEmits = [];
      this._emitBatchTimeout = null;

      // Dedupe by event type, keeping last value
      const deduped = new Map();
      emits.forEach(e => deduped.set(e.event, e.data));

      deduped.forEach((data, event) => this._doEmit(event, data));
    });
  }

  // --- State Access ---
  getState() { return this.state; }

  // Proxy getters for backward compatibility
  get stats() {
    return {
      ...this.state.stats,
      stability: this.state.neuro?.stability || 100
    };
  }
  get kpis() { return this.state.kpis; }
  get day() { return this.state.day; }
  get time() { return this.state.time; }
  get prison() { return this.state.prison; }
  get grow() { return this.state.grow; }
  get casino() { return this.state.casino; }
  get neuro() { return this.state.neuro; }

  // --- Dispatchers (Reducers) ---
  updateStat(name, delta) {
    if (!(name in this.state.stats)) return;

    const oldVal = this.state.stats[name];
    const newVal = Math.max(0, Math.min(100, oldVal + delta));

    if (oldVal === newVal) return; // No change, skip emit

    this.state.stats[name] = newVal;
    this.emit(`stats:${name}`, newVal);
    this.emit('change', { type: 'stat', name, value: newVal });
  }

  updateKPI(name, delta) {
    if (!(name in this.state.kpis)) return;

    this.state.kpis[name] += delta;
    this.emit(`kpis:${name}`, this.state.kpis[name]);
    this.emit('change', { type: 'kpi', name, value: this.state.kpis[name] });
  }

  updatePath(name, delta) {
    if (!this.state.paths) this.state.paths = { music: 0, chaos: 0, survival: 0 };
    this.state.paths[name] = (this.state.paths[name] || 0) + delta;
    this.emit(`paths:${name}`, this.state.paths[name]);
    this.emit('change', { type: 'path', name, value: this.state.paths[name] });
  }

  saveOnly() {
    try {
      localStorage.setItem('pryton_save', JSON.stringify(this.state));
    } catch (e) {
      logger.error('[GameState] Ошибка сохранения:', e);
    }
  }

  updateState(partial) {
    Object.assign(this.state, partial);
    this.emit('change', { type: 'bulk', data: partial });
  }

  updateHome(key, val) {
    if (this.state.home) {
      this.state.home[key] = val;
      this.emit('home:change', this.state.home);
    }
  }

  canAfford(amount) {
    return (this.state.kpis.cash || 0) >= amount;
  }

  addLogEntry(text, type = 'neutral') {
    const entry = { text, type, timestamp: Date.now(), day: this.state.day };
    if (!this.state.log) this.state.log = [];
    this.state.log.push(entry);
    if (this.state.log.length > 50) this.state.log.shift();
    this.emit('log', entry, true); // Immediate for visual feedback
  }

  advanceTime(minutes) {
    this.state.time += minutes;
    const minsPerDay = 1440;

    while (this.state.time >= minsPerDay) {
      this.state.time -= minsPerDay;
      this.state.day++;

      // Daily growth progress
      if (this.state.grow && this.state.grow.active) {
        this.state.grow.growthDays++;
        this.state.grow.risk += 5;
      }

      // Daily Neuro Decay
      if (this.state.neuro) {
        let decay = -2;
        if (this.state.neuro.implants?.includes('ghost_filter')) {
          decay = -1; // 50% slower decay
        }
        this.updateNeuro('stability', decay);
      }

      // Daily Music Royalties & Decay
      if (this.state.music && this.state.music.tracks) {
        let totalRoyalties = 0;
        this.state.music.tracks = this.state.music.tracks.filter(track => {
          // Calculate royalty: Quality * Hype / 100
          const royalty = Math.floor(track.quality * (track.hype / 100));
          totalRoyalties += royalty;

          // Hype decays
          track.hype = Math.max(0, track.hype - 10);

          // Remove track if no hype left (dead track)
          return track.hype > 0;
        });

        if (totalRoyalties > 0) {
          this.updateKPI('cash', totalRoyalties);
          this.addLogEntry(`РОЯЛТИ: Получено ₽${totalRoyalties} со стриминга.`, 'info');
        }
      }

      // Daily Crypto Rate Fluctuation
      if (this.state.farm) {
        const change = 1 + (Math.random() * 0.2 - 0.1); // +/- 10%
        const worldMult = this.state.world?.multipliers?.crypto_rate || 1;
        this.state.farm.cryptoRate = Math.floor(this.state.farm.cryptoRate * change * worldMult);
        this.addLogEntry(`БИРЖА: Курс PrytonCoin теперь ₽${this.state.farm.cryptoRate}`, 'info');
      }

      // Обновление мира (новости, множители)
      worldEngine.advanceWorld();

      this.emit('newDay', this.state.day, true); // Immediate
    }
    this.emit('time', this.state.time);
  }

  jailTick() {
    if (this.state.status === 'PRISON' && this.state.jailTime > 0) {
      this.state.jailTime--;
      if (this.state.jailTime <= 0) {
        this.state.status = 'FREE';
        this.state.jailTime = 0;
        this.addLogEntry('СРОК ОКОНЧЕН. ВЫХОДИ НА СВОБОДУ.', 'good');
      }
      this.emit('jail:tick', this.state.jailTime);
    }
  }

  updateTime(minutes) {
    this.advanceTime(minutes);
  }

  // --- Farm System (Mining) ---
  farmTick() {
    const f = this.state.farm;
    if (!f) return;

    const now = Date.now();
    const elapsed = (now - f.lastSync) / 1000;
    if (elapsed < 1) return;

    if (f.gpus.length === 0) {
      f.temp += (FARM_DATA.baseTemp - f.temp) * 0.05;
      f.lastSync = now;
      return;
    }

    let totalHash = 0;
    let totalHeat = 0;
    f.gpus.forEach(id => {
      const g = FARM_DATA.gpus.find(x => x.id === id);
      if (g) { totalHash += g.hashrate; totalHeat += g.heat; }
    });

    let totalCooling = 0;
    f.coolers.forEach(id => {
      const c = FARM_DATA.coolers.find(x => x.id === id);
      if (c) totalCooling += c.cooling;
    });

    const targetTemp = FARM_DATA.baseTemp + Math.max(0, totalHeat - totalCooling);
    f.temp += (targetTemp - f.temp) * 0.05;

    let mult = 1;
    if (f.temp > FARM_DATA.overheatThreshold) {
      mult = 0.5;
      if (Math.random() < 0.001 * elapsed) {
        const idx = Math.floor(Math.random() * f.gpus.length);
        const burnt = f.gpus.splice(idx, 1)[0];
        this.addLogEntry(`ПЕРЕГРЕВ: Карта ${burnt} сгорела!`, 'danger');
      }
    }

    const mined = (totalHash / 3600) * elapsed * mult;
    f.coins += mined;

    // Electricity cost (rubles per hour -> per sec)
    const cost = (f.gpus.length * FARM_DATA.electricityCostPerRig / 3600) * elapsed;
    if (this.state.kpis.cash >= cost) {
      this.state.kpis.cash -= cost;
    } else {
      // No money? Throttling or shut down
      f.coins -= mined * 0.8;
    }

    // --- Greenhouse Tick ---
    if (f.greenhouse) {
      const gh = f.greenhouse;
      // Decay levels
      gh.waterLevel = Math.max(0, gh.waterLevel - 0.01 * elapsed);
      gh.lightLevel = Math.max(0, gh.lightLevel - 0.005 * elapsed);

      let currentSmell = 0;
      gh.slots.forEach(slot => {
        if (slot.seedId) {
          const seed = FARM_DATA.seeds.find(s => s.id === slot.seedId);
          if (seed) {
            // Growth
            let speedMult = (gh.waterLevel > 20 && gh.lightLevel > 20) ? 1 : 0.2;
            slot.progress = Math.min(100, slot.progress + (100 / seed.growthTime) * elapsed * speedMult);

            // Quality/Health decay if bad conditions
            if (gh.waterLevel < 10 || gh.lightLevel < 10) slot.health = Math.max(0, slot.health - 0.05 * elapsed);

            currentSmell += seed.aroma * (slot.progress / 100);
          }
        }
      });

      // Apply Filter
      if (gh.carbonFilter) {
        const filter = FARM_DATA.equipment.find(e => e.id === 'carbon_filter');
        if (filter) currentSmell *= (1 - filter.reduction);
      }

      gh.smellLevel = currentSmell;

      // Police Raid Risk (based on smell and mining camo)
      const camo = Math.min(0.5, f.gpus.length * 0.05);
      const raidBaseChance = gh.smellLevel / 10000;
      if (Math.random() < raidBaseChance * (1 - camo) * elapsed) {
        this.triggerPoliceRaid();
      }
    }

    f.lastSync = now;
    this.emit('farm:tick', f);
  }

  triggerPoliceRaid() {
    const f = this.state.farm;
    if (!f || !f.greenhouse) return;

    this.addLogEntry('ОБЛАВА! Полиция обнаружила незаконную оранжерею!', 'danger');
    this.updateStat('health', -20);
    this.updateKPI('cash', -10000);
    f.greenhouse.slots = Array(4).fill(null).map(() => ({ seedId: null, progress: 0, quality: 100, health: 100 }));

    if (window.uiManager) {
      window.uiManager.showToast('ТЕБЯ НАКРЫЛИ! Оранжерея зачищена.', 'error');
      if (window.uiManager.tabs.prison) {
        window.uiManager.tabs.prison.arrest(600);
      }
    }
  }

  calculateOfflineEarnings() {
    const f = this.state.farm;
    if (!f || f.gpus.length === 0) return null;

    const now = Date.now();
    const elapsedSeconds = (now - f.lastSync) / 1000;
    if (elapsedSeconds < 60) return null; // Min 1 minute for offline reward

    let totalHash = 0;
    let totalHeat = 0;
    f.gpus.forEach(id => {
      const g = FARM_DATA.gpus.find(x => x.id === id);
      if (g) { totalHash += g.hashrate; totalHeat += g.heat; }
    });

    let totalCooling = 0;
    f.coolers.forEach(id => {
      const c = FARM_DATA.coolers.find(x => x.id === id);
      if (c) totalCooling += c.cooling;
    });

    const finalTemp = FARM_DATA.baseTemp + Math.max(0, totalHeat - totalCooling);
    let mult = 1;
    let burntCard = null;

    if (finalTemp > FARM_DATA.overheatThreshold) {
      mult = 0.5;
      // High risk of burning if left unattended
      if (Math.random() < 0.2) {
        const idx = Math.floor(Math.random() * f.gpus.length);
        burntCard = f.gpus.splice(idx, 1)[0];
      }
    }

    const mined = (totalHash / 3600) * elapsedSeconds * mult;
    const electricity = (f.gpus.length * FARM_DATA.electricityCostPerRig / 3600) * elapsedSeconds;

    f.coins += mined;
    this.state.kpis.cash = Math.max(0, this.state.kpis.cash - electricity);
    f.lastSync = now;

    return { mined, electricity, burntCard, seconds: elapsedSeconds };
  }

  updateNeuro(key, delta) {
    if (!this.state.neuro) return;
    const oldVal = this.state.neuro[key] || 0;
    const max = key === 'stability' ? (this.state.neuro.maxStability || 100) : 100;
    const newVal = Math.max(0, Math.min(max, oldVal + delta));

    this.state.neuro[key] = newVal;
    this.emit(`neuro:${key}`, newVal);
    this.emit('change', { type: 'neuro', name: key, value: newVal });

    // Psychosis Check
    if (key === 'stability' && newVal <= 0 && this.state.status !== 'HOSPITAL') {
      this.triggerPsychosis();
    }
  }

  triggerPsychosis() {
    this.state.status = 'HOSPITAL';
    this.addLogEntry('КРИТИЧЕСКИЙ СБОЙ: ПОЛНЫЙ ПСИХОЗ. ТЕБЯ УВЕЗЛИ В КЛИНИКУ.', 'danger');
    this.emit('status:psychosis', true);
  }

  // --- Persistent Storage ---
  save() {
    try {
      localStorage.setItem('pryton_save_v4', JSON.stringify(this.state));
      logger.info('[GameState] Сохранено в чертоги разума');
    } catch (e) {
      logger.error('[GameState] Save failed:', e);
    }
  }

  load() {
    try {
      const data = localStorage.getItem('pryton_save_v4');
      if (!data) return false;

      const savedState = JSON.parse(data);

      // Deep merge with INITIAL_STATE to ensure new keys exist
      this.state = this._deepMerge(
        JSON.parse(JSON.stringify(INITIAL_STATE)),
        savedState
      );

      this.emit('load', this.state, true);
      return true;
    } catch (e) {
      logger.error('[GameState] Load failed:', e);
      return false;
    }
  }

  /**
   * Deep merge for nested objects - more efficient than previous approach
   * @private
   */
  _deepMerge(target, source) {
    const output = { ...target };

    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (target[key] && typeof target[key] === 'object') {
          output[key] = this._deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    }

    return output;
  }
}

export const gameState = new GameState();
window.gameState = gameState;
export default gameState;

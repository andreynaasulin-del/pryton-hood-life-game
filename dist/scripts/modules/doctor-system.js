import { gameState } from './game-state.js';
import { DOCTOR_CONFIG } from '../data/doctor-config.js';
import { windowManager } from './core/WindowManager.js';
import { logger } from './logger.js';

export class DoctorSystem {
  constructor() {
    this.config = DOCTOR_CONFIG;
  }

  init() {
    // Реактивное поведение: если адекватность падает слишком низко - авто-предупреждение
    gameState.subscribe('stats:adequacy', (val) => {
      if (val < 20) this.triggerPsychosisWarning();
    });
    logger.info('[DoctorSystem] Клиника открыта');
  }

  getDiagnosis() {
    const adequacy = gameState.stats.adequacy;
    const diag = this.config.diagnoses.find(d => adequacy >= d.threshold) || this.config.diagnoses[2];
    return diag;
  }

  buyMedicine(medId) {
    const med = this.config.meds.find(m => m.id === medId);
    const kpis = gameState.kpis;

    if (kpis.cash >= med.price) {
      gameState.updateKPI('cash', -med.price);

      // Apply effects
      Object.entries(med.effects).forEach(([stat, val]) => {
        gameState.updateStat(stat, val);
      });

      gameState.addLogEntry(`Принял ${med.name}. Стало полегче.`, 'good');
      return true;
    }
    return false;
  }

  startSession() {
    const diagnosis = this.getDiagnosis();
    const content = `
            <div class="doctor-session">
                <p class="diag-text">"${diagnosis.text}"</p>
                <div class="meds-list">
                    ${this.config.meds.map(m => `
                        <button class="med-btn" onclick="window.doctorSystem.handleBuy('${m.id}')">
                            ${m.name} (${m.price}₽)
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    windowManager.showModal('СЕССИЯ У ДОКТОРА', content);
  }

  handleBuy(id) {
    if (this.buyMedicine(id)) {
      windowManager.showNotification('Лекарство куплено', 'success');
      // Refresh modal or stay? Let's refresh UI
      if (window.uiManager) window.uiManager.renderAll();
    } else {
      windowManager.showNotification('Недостаточно кэша', 'error');
    }
  }

  triggerPsychosisWarning() {
    gameState.addLogEntry('РЕАЛЬНОСТЬ РАСПОЛЗАЕТСЯ. ТЕБЕ НУЖНЫ ТАБЛЕТКИ.', 'danger');
  }
}

const doctorSystem = new DoctorSystem();
window.doctorSystem = doctorSystem;
export default doctorSystem;

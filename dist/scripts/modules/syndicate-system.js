import { gameState } from './game-state.js';
import uiManager from './ui-manager.js';
import eventSystem from './event-system.js';

class SyndicateSystem {
    constructor() {
        this.basePayment = 1500;
        this.paymentCycle = 3; // Days
    }

    init() {
        // Any init logic
    }

    checkDailyStatus() {
        const s = gameState.getState();
        const syn = s.syndicate;
        if (!syn || !syn.active) return;

        const day = s.day;
        const daysLeft = syn.nextPaymentDay - day;

        // 1. Day of payment (Deadline)
        if (daysLeft === 0) {
            gameState.addLogEntry('⚠️ СЕГОДНЯ ДЕНЬ ВЫПЛАТЫ! КОЛЛЕКТОР УЖЕ В ПУТИ.', 'bad');
            uiManager.showToast('⚠️ СРОК: ОПЛАТИ ДОЛГ СЕГОДНЯ!', 'warning');
        }

        // 2. Overdue (Passed deadline)
        if (daysLeft < 0) {
            this.handleOverdue();
        }
    }

    handleOverdue() {
        const s = gameState.getState();
        const syn = s.syndicate;

        syn.daysOverdue++;
        syn.warnings++;

        // Initial Penalty (Day 1 late)
        if (syn.daysOverdue === 1) {
            this.triggerPunishmentLv1();
        }
        // Severe Penalty (Day 2-3 late)
        else if (syn.daysOverdue < 4) {
            this.triggerPunishmentLv2();
        }
        // Game Over (Day 4 late)
        else {
            this.triggerGameOver();
        }
    }

    triggerPunishmentLv1() {
        // Syndicate goons take cash or beat you up
        const s = gameState.getState();
        const taken = Math.min(s.kpis.cash, 1000);

        s.kpis.cash -= taken;
        s.stats.health -= 20;
        s.kpis.respect -= 10;

        eventSystem.triggerEvent({
            id: 'syn_punish_1',
            title: '👊 КОЛЛЕКТОРЫ: ПРЕДУПРЕЖДЕНИЕ',
            category: 'danger',
            description: `Вы пропустили платеж. ${taken > 0 ? 'Парни забрали всё что было в карманах' : 'Денег не нашли'} и отбили почки.`,
            choices: [
                {
                    text: 'Утереть кровь',
                    success: { text: 'Долг всё еще висит!', effects: {} }
                }
            ]
        });
    }

    triggerPunishmentLv2() {
        // Severe damage, steal inventory
        gameState.getState().stats.health -= 40;
        gameState.getState().stats.stability -= 30;

        // Steal random item
        const inventory = gameState.getState().inventory;
        if (inventory.length > 0) {
            const lostItem = inventory.pop();
            gameState.addLogEntry(`Коллекторы забрали: ${lostItem.name}`, 'bad');
        }

        eventSystem.triggerEvent({
            id: 'syn_punish_2',
            title: '☠️ КОЛЛЕКТОРЫ: ПОСЛЕДНЕЕ СЛОВО',
            category: 'danger',
            description: 'В следующий раз мы тебя не бить будем. Мы тебя закопаем. Плати или умри.',
            choices: [{ text: 'Понял...', success: { text: 'Здоровье критическое.', effects: {} } }]
        });
    }

    triggerGameOver() {
        // Permadeath logic
        gameState.triggerGameOver(); // Or specialized Syndicate ending
    }

    payDebt() {
        const s = gameState.getState();
        const syn = s.syndicate;

        if (s.kpis.cash >= syn.currentPayment) {
            s.kpis.cash -= syn.currentPayment;
            syn.debt -= syn.currentPayment;
            syn.totalPaid += syn.currentPayment;

            // Advance next payment date
            syn.nextPaymentDay = s.day + this.paymentCycle;
            syn.daysOverdue = 0;

            // Increase payment slightly (inflation/interest)
            syn.currentPayment = Math.floor(syn.currentPayment * 1.1);

            gameState.addLogEntry('💸 Долг уплачен. Синдикат доволен... пока что.', 'good');
            uiManager.showToast('ДОЛГ ПОГАШЕН', 'success');
            uiManager.renderAll();
        } else {
            uiManager.showToast('НЕДОСТАТОЧНО СРЕДСТВ', 'error');
        }
    }

    getDebtStatus() {
        const s = gameState.getState();
        const syn = s.syndicate;
        if (!syn) return null;

        const daysLeft = syn.nextPaymentDay - s.day;
        return {
            amount: syn.currentPayment,
            daysLeft: daysLeft,
            isOverdue: daysLeft < 0,
            statusColor: daysLeft < 0 ? '#ef4444' : (daysLeft === 0 ? '#f59e0b' : '#10b981')
        };
    }
}

const syndicateSystem = new SyndicateSystem();
export default syndicateSystem;

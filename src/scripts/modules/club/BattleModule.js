/**
 * BATTLE MODULE - Rap Battle Logic
 * Вся логика баттлов, турниров и фристайлов
 */

import { gameState } from '../game-state.js';
import { Utils } from '../utils.js';
import { logger } from '../logger.js';

export class BattleModule {
    constructor() {
        this.battleState = null;
        this.battleTimer = null;
        this.tournamentState = null;

        // Battle opponents
        this.opponents = [
            { id: 'newbie', name: 'Первоход', icon: 'user', skill: 20, bet: 100, fame: 10, desc: 'Дрожащий голос' },
            { id: 'local', name: 'Местный', icon: 'map-pin', skill: 40, bet: 300, fame: 25, desc: 'Знает расклады' },
            { id: 'veteran', name: 'Битый', icon: 'shield', skill: 60, bet: 700, fame: 50, desc: 'Шрамы на языке' },
            { id: 'champion', name: 'Авторитет', icon: 'crown', skill: 80, bet: 1500, fame: 100, desc: 'Решает вопросы словом' },
            { id: 'king', name: 'Призрак Притона', icon: 'skull', skill: 95, bet: 5000, fame: 300, desc: 'Говорят, он не человек', minFame: 200 }
        ];

        // Battle phrases
        this.battlePhrases = [
            { text: 'Твой текст — белый шум', type: 'diss', power: 2 },
            { text: 'Ты делаешь музыку. Я живу ей.', type: 'diss', power: 2 },
            { text: 'Ты читаешь — люди засыпают', type: 'diss', power: 2 },
            { text: 'Твой респект — на уровне погрешности', type: 'diss', power: 3 },
            { text: 'Ты не конкурент. Ты фон.', type: 'diss', power: 3 },
            { text: 'Я пишу, чтобы забыть. Ты пишешь, чтобы казаться.', type: 'deep', power: 3 },
            { text: 'Между нами — пропасть. Я на дне, ты даже не видел края.', type: 'deep', power: 3 },
            { text: 'Когда я замолчу — останется эхо. После тебя — тишина.', type: 'deep', power: 3 },
            { text: 'Мы оба тонем. Но я научился дышать под водой.', type: 'deep', power: 4 },
            { text: 'Ты боишься правды. Я ею питаюсь.', type: 'deep', power: 3 },
            { text: 'Притон молчит, когда я говорю', type: 'street', power: 3 },
            { text: 'Мой флоу — это сырость стен в этом подвале', type: 'street', power: 2 },
            { text: 'Ты турист в этих дворах. Я здесь вырос.', type: 'street', power: 3 },
            { text: 'Районный бетон научил меня больше, чем твоя жизнь', type: 'street', power: 3 },
            { text: 'Ты играешь в улицу. Улица играет мной.', type: 'street', power: 4 },
            { text: 'Ты гуглишь рифмы, я режу по живому', type: 'skill', power: 2 },
            { text: 'Мой панчлайн — твоя госпитализация', type: 'skill', power: 3 },
            { text: 'Ты запинаешься там, где я разгоняюсь', type: 'skill', power: 2 },
            { text: 'Я читаю на выдохе быстрее, чем ты думаешь', type: 'skill', power: 3 },
            { text: 'Техника? Ты вообще знаешь, что это?', type: 'skill', power: 2 },
            { text: 'Мой последний трек собрал больше, чем вся твоя карьера', type: 'flex', power: 2 },
            { text: 'Ты мечтаешь о том, что я уже прошёл', type: 'flex', power: 2 },
            { text: 'Я уже был там, куда ты ещё не доберёшься', type: 'flex', power: 3 }
        ];

        this.tournaments = [
            {
                id: 'basement',
                name: 'Подвальный Турнир',
                icon: 'home',
                entryFee: 100,
                rounds: 2,
                opponents: ['newbie', 'local'],
                prizes: { cash: 500, fame: 30 },
                minFame: 0,
                tier: 'common'
            },
            {
                id: 'city',
                name: 'Городской Чемпионат',
                icon: 'building',
                entryFee: 500,
                rounds: 3,
                opponents: ['local', 'veteran', 'champion'],
                prizes: { cash: 2500, fame: 100 },
                minFame: 50,
                tier: 'rare'
            },
            {
                id: 'league',
                name: 'Андеграунд Лига',
                icon: 'trophy',
                entryFee: 2000,
                rounds: 4,
                opponents: ['veteran', 'champion', 'king', 'king'],
                prizes: { cash: 10000, fame: 500 },
                minFame: 200,
                tier: 'legendary'
            }
        ];
    }

    startBattle(opponentId) {
        const opponent = this.opponents.find(o => o.id === opponentId);
        if (!opponent) {
            logger.error('[BattleModule] Opponent not found:', opponentId);
            return false;
        }

        this.battleState = {
            opponentId,
            round: 1,
            maxRounds: 3,
            playerScore: 100,
            opponentScore: 100,
            combo: 0,
            turnTime: 10,
            endTime: Date.now() + 10000,
            currentPhrases: this.getRandomPhrases(3),
            message: 'Баттл начинается! Твой ход.'
        };

        this.startBattleTimer();
        return true;
    }

    getRandomPhrases(count) {
        return Utils.shuffleArray(this.battlePhrases).slice(0, count);
    }

    startBattleTimer() {
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
        }

        this.battleTimer = setInterval(() => {
            if (!this.battleState) {
                clearInterval(this.battleTimer);
                return;
            }

            const timeLeft = Math.max(0, Math.ceil((this.battleState.endTime - Date.now()) / 1000));

            if (timeLeft <= 0) {
                this.battleState.message = 'Время вышло! Противник атакует.';
                setTimeout(() => this.opponentAttack(), 500);
            }
        }, 100);
    }

    selectPhrase(phraseIndex) {
        if (!this.battleState) return;

        const phrases = this.battleState.currentPhrases;
        if (!phrases[phraseIndex]) return;

        const phrase = phrases[phraseIndex];
        const damage = phrase.power * 8 + Math.floor(Math.random() * 5);

        this.battleState.opponentScore = Math.max(0, this.battleState.opponentScore - damage);
        this.battleState.message = `Ты: "${phrase.text}" (-${damage} HP)`;

        // Wait and response
        setTimeout(() => this.opponentAttack(), 1000);
    }

    opponentAttack() {
        if (!this.battleState) return;

        const opponent = this.opponents.find(o => o.id === this.battleState.opponentId);
        const damage = Math.floor(((opponent?.skill || 50) / 10) + Math.random() * 10);

        this.battleState.playerScore = Math.max(0, this.battleState.playerScore - damage);
        this.battleState.message = `${opponent.name}: "Слабо..." (-${damage} HP)`;

        setTimeout(() => this.nextRound(), 1200);
    }

    nextRound() {
        if (!this.battleState) return;

        if (this.battleState.playerScore <= 0) {
            this.endBattle(false);
            return;
        }
        if (this.battleState.opponentScore <= 0) {
            this.endBattle(true);
            return;
        }

        this.battleState.round++;
        if (this.battleState.round > this.battleState.maxRounds) {
            this.endBattle(this.battleState.playerScore > this.battleState.opponentScore);
            return;
        }

        this.battleState.message = `Раунд ${this.battleState.round}. Твой ход!`;
        this.battleState.endTime = Date.now() + 10000;
        this.battleState.currentPhrases = this.getRandomPhrases(3);
    }

    endBattle(won) {
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }

        const opponent = this.opponents.find(o => o.id === this.battleState.opponentId);
        const state = gameState.getState();

        if (won) {
            const cashReward = opponent.bet; // Gain the bet
            const fameReward = opponent.fame;

            gameState.updateState({
                kpis: { ...state.kpis, cash: state.kpis.cash + cashReward },
                music: {
                    ...state.music,
                    fame: (state.music?.fame || 0) + fameReward,
                    battleWins: (state.music?.battleWins || 0) + 1
                }
            });
            logger.info('[BattleModule] Won battle');
        } else {
            gameState.updateState({
                kpis: { ...state.kpis, cash: Math.max(0, state.kpis.cash - opponent.bet) },
                music: {
                    ...state.music,
                    battleLosses: (state.music?.battleLosses || 0) + 1
                }
            });
            logger.info('[BattleModule] Lost battle');
        }

        this.battleState = null;
        return won;
    }

    quitBattle() {
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        this.battleState = null;
    }

    destroy() {
        if (this.battleTimer) {
            clearInterval(this.battleTimer);
            this.battleTimer = null;
        }
        this.battleState = null;
    }
}

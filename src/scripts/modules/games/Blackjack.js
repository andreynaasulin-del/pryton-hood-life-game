import { gameState } from '../game-state.js';

/**
 * BLACKJACK GAME - V4.0 (LUXURY NOIR)
 * Premier card game for high-stakes underground play.
 */
const BlackjackGame = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    bet: 100,
    isGameActive: false,

    // Card assets
    suits: ['♠', '♥', '♦', '♣'],
    values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],

    initialized: false,
    uiManager: null,
    el: null, // DOM Elements cache

    init(manager) {
        // We allow re-initialization if elements were missing before
        console.log('[Blackjack] Initializing tactical layer...');
        this.uiManager = manager;

        const dealerArea = document.getElementById('dealerCards');
        const playerArea = document.getElementById('playerCards');

        if (!dealerArea || !playerArea) {
            console.warn('[Blackjack] System fail: UI components not found in DOM.');
            return;
        }

        // Cache elements
        this.el = {
            dealerArea: dealerArea,
            playerArea: playerArea,
            dealerScore: document.getElementById('dealerScore'),
            playerScore: document.getElementById('playerScore'),
            message: document.getElementById('bjMessage'),
            chips: document.getElementById('bjChips'),
            ghostBtn: document.getElementById('ghostLuckBJBtn'),
            hitBtn: document.querySelector('.hit-btn'),
            standBtn: document.querySelector('.stand-btn'),
            dealBtn: document.querySelector('.deal-btn'),
            backBtn: document.getElementById('backToLobbyBtnBJ')
        };

        // Bind events via UIManager for safety if possible, or direct
        if (this.el.dealBtn) this.el.dealBtn.onclick = () => this.startGame();
        if (this.el.hitBtn) this.el.hitBtn.onclick = () => this.hit();
        if (this.el.standBtn) this.el.standBtn.onclick = () => this.stand();
        if (this.el.backBtn) this.el.backBtn.onclick = () => {
            if (this.isGameActive) {
                if (confirm('Сдаться? Ставка будет потеряна.')) {
                    this.isGameActive = false;
                    this.uiManager.backToLobby();
                }
            } else {
                this.uiManager.backToLobby();
            }
        };

        // Ghost Luck
        if (this.el.ghostBtn) {
            this.el.ghostBtn.onclick = () => this.peekDealerCard();
        }

        // Handle bet input
        const betInput = document.getElementById('bjBetInput');
        if (betInput) {
            betInput.onchange = () => this.updateBetFromInput();
        }

        this.initialized = true;
        window.blackjackGame = this;

        this.updateBalanceUI();
        this.updateControls();
    },

    open() {
        console.log('[Blackjack] Establishing secure session...');
        // If not initialized (missing elements), try to init now since open() is called after HTML injection
        if (!this.initialized || !this.el) {
            this.init(this.uiManager || window.uiManager);
        }

        this.isGameActive = false;
        if (this.el) {
            this.updateControls();
            if (this.el.dealerArea) this.el.dealerArea.innerHTML = '';
            if (this.el.playerArea) this.el.playerArea.innerHTML = '';
            if (this.el.message) {
                this.el.message.textContent = "ВАШИ СТАВКИ, ГОСПОДА";
                this.el.message.className = 'bj-message';
            }
            if (this.el.dealerScore) this.el.dealerScore.textContent = '';
            if (this.el.playerScore) this.el.playerScore.textContent = '';
            this.updateBalanceUI();
        }
    },

    updateBetFromInput() {
        const input = document.getElementById('bjBetInput');
        if (input) {
            let val = parseInt(input.value);
            if (isNaN(val) || val < 10) val = 10;
            this.bet = val;
            this.updateControls();
        }
    },

    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let value of this.values) {
                this.deck.push({ suit, value });
            }
        }
        // Fisher-Yates Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    },

    getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.value)) return 10;
        if (card.value === 'A') return 11;
        return parseInt(card.value);
    },

    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
            score += this.getCardValue(card);
            if (card.value === 'A') aces++;
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    },

    renderCard(card, container, hidden = false, index = 0) {
        const cardEl = document.createElement('div');
        cardEl.className = 'v4-card-prop';
        // Animation delay for fluid dealing
        cardEl.style.setProperty('--card-idx', index);

        if (hidden) {
            cardEl.classList.add('is-hidden');
            cardEl.innerHTML = `<div class="card-back-suit"></div>`;
        } else {
            const isRed = ['♥', '♦'].includes(card.suit);
            cardEl.classList.add(isRed ? 'is-red' : 'is-black');

            cardEl.innerHTML = `
                <div class="card-corner top">
                    <span>${card.value}</span>
                    <span>${card.suit}</span>
                </div>
                <div class="card-center-icon">${card.suit}</div>
                <div class="card-corner bottom">
                    <span>${card.value}</span>
                    <span>${card.suit}</span>
                </div>
            `;
        }

        container.appendChild(cardEl);
    },

    updateUI(revealDealer = false) {
        if (!this.el) return;
        this.el.dealerArea.innerHTML = '';
        this.el.playerArea.innerHTML = '';

        // Dealer Render
        this.dealerHand.forEach((card, index) => {
            const isHidden = index === 1 && !revealDealer;
            this.renderCard(card, this.el.dealerArea, isHidden, index);
        });

        // Dealer Score Display Logic
        if (revealDealer) {
            this.el.dealerScore.textContent = this.calculateScore(this.dealerHand);
        } else if (this.dealerHand.length > 0) {
            let val = this.getCardValue(this.dealerHand[0]);
            this.el.dealerScore.textContent = val === 11 ? "11" : val;
        }

        // Player Render
        this.playerHand.forEach((card, index) => {
            this.renderCard(card, this.el.playerArea, false, index);
        });
        this.el.playerScore.textContent = this.calculateScore(this.playerHand);

        this.updateBalanceUI();
    },

    updateControls() {
        if (!this.el) return;

        const isGame = this.isGameActive;
        if (this.el.hitBtn) this.el.hitBtn.style.display = isGame ? 'flex' : 'none';
        if (this.el.standBtn) this.el.standBtn.style.display = isGame ? 'flex' : 'none';
        if (this.el.dealBtn) {
            this.el.dealBtn.style.display = isGame ? 'none' : 'flex';
            this.el.dealBtn.querySelector('span').textContent = `СТАВКА: ₽${this.bet.toLocaleString()}`;
        }
    },

    updateBalanceUI() {
        if (!this.el) return;
        const chips = gameState.getState().casino?.chips || 0;
        if (this.el.chips) this.el.chips.textContent = chips.toLocaleString();

        if (this.el.ghostBtn) {
            const hasHealth = (gameState.stats?.health || 0) >= 10;
            this.el.ghostBtn.disabled = !this.isGameActive || !hasHealth;
            this.el.ghostBtn.style.opacity = this.isGameActive && hasHealth ? '1' : '0.5';
        }
    },

    peekDealerCard() {
        if (!this.isGameActive) return;
        if (gameState.stats.health < 10) {
            this.uiManager?.showToast("Недостаточно здоровья для спиритизма", "error");
            return;
        }

        gameState.updateStat('health', -10);

        const hiddenCard = this.el.dealerArea.querySelector('.v4-card-prop.is-hidden');
        if (hiddenCard && this.dealerHand[1]) {
            const card = this.dealerHand[1];
            hiddenCard.classList.add('ghost-peek');
            hiddenCard.classList.remove('is-hidden');
            const isRed = ['♥', '♦'].includes(card.suit);
            hiddenCard.classList.add(isRed ? 'is-red' : 'is-black');
            hiddenCard.innerHTML = `
                <div class="card-corner top"><span>${card.value}</span><span>${card.suit}</span></div>
                <div class="card-center-icon">${card.suit}</div>
                <div class="card-corner bottom"><span>${card.value}</span><span>${card.suit}</span></div>
                <div class="peek-vignette"></div>
            `;
            gameState.addLogEntry("Дух позволил заглянуть в карты дилера.", "spirit");
            this.el.ghostBtn.disabled = true; // One use per hand
        }
    },

    startGame() {
        if (this.isGameActive) return;
        const state = gameState.getState();
        const chips = state.casino?.chips || 0;

        if (chips < this.bet) {
            this.uiManager?.showToast("Недостаточно фишек для игры", "error");
            return;
        }

        // Deduct chips
        gameState.updateState({
            casino: { ...state.casino, chips: chips - this.bet }
        });

        this.isGameActive = true;
        this.playerHand = [];
        this.dealerHand = [];
        this.createDeck();
        this.updateControls();

        if (this.el.message) {
            this.el.message.textContent = "ВАШ ХОД...";
            this.el.message.className = 'bj-message active';
        }

        // Initial Deal
        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());
        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());

        this.updateUI(false);

        // Check for natural blackjack
        const pScore = this.calculateScore(this.playerHand);
        if (pScore === 21) {
            this.finalizeRound(); // Instant win if 21 on deal
        }
    },

    hit() {
        if (!this.isGameActive) return;
        this.playerHand.push(this.deck.pop());
        this.updateUI(false);

        const score = this.calculateScore(this.playerHand);
        if (score > 21) {
            this.endGame('bust');
        } else if (score === 21) {
            this.stand();
        }
    },

    async stand() {
        if (!this.isGameActive) return;

        this.updateUI(true);
        let dScore = this.calculateScore(this.dealerHand);

        // Dealer logic: hit until 17
        while (dScore < 17) {
            await new Promise(r => setTimeout(r, 800));
            this.dealerHand.push(this.deck.pop());
            dScore = this.calculateScore(this.dealerHand);
            this.updateUI(true);
        }

        await new Promise(r => setTimeout(r, 400));
        this.finalizeRound();
    },

    finalizeRound() {
        const pScore = this.calculateScore(this.playerHand);
        const dScore = this.calculateScore(this.dealerHand);

        if (pScore > 21) {
            this.endGame('bust');
        } else if (dScore > 21) {
            this.endGame('win');
        } else if (pScore > dScore) {
            this.endGame('win');
        } else if (pScore === dScore) {
            this.endGame('push');
        } else {
            this.endGame('lose');
        }
    },

    endGame(result) {
        this.isGameActive = false;
        const state = gameState.getState();
        const chips = state.casino?.chips || 0;

        let message = "";
        let winAmount = 0;

        if (result === 'win') {
            const isBJ = this.playerHand.length === 2 && this.calculateScore(this.playerHand) === 21;
            winAmount = Math.floor(this.bet * (isBJ ? 2.5 : 2));
            message = isBJ ? "БЛЭКДЖЕК! КУШ ПРИНЯТ" : "ПОБЕДА // СРЕДСТВА ЗАЧИСЛЕНЫ";
            this.el.message.className = "bj-message win";
            gameState.addLogEntry(`Казино: Победа в Блэкджек +${winAmount - this.bet} фишек`, "good");
        } else if (result === 'push') {
            winAmount = this.bet;
            message = "РОВНО // СТАВКА ВОЗВРАЩЕНА";
            this.el.message.className = "bj-message push";
        } else if (result === 'bust') {
            message = "ПЕРЕБОР // СТАВКА УТИЛИЗИРОВАНА";
            this.el.message.className = "bj-message lose";
            gameState.addLogEntry(`Казино: Перебор в Блэкджек. -${this.bet} фишек`, "neutral");
        } else {
            message = "ДИЛЕР ВЫИГРАЛ // СИСТЕМА ПОБЕДИЛА";
            this.el.message.className = "bj-message lose";
            gameState.addLogEntry(`Казино: Дилер выиграл. -${this.bet} фишек`, "neutral");
        }

        if (winAmount > 0) {
            gameState.updateState({
                casino: { ...state.casino, chips: chips + winAmount }
            });
        }

        if (this.el.message) this.el.message.textContent = message;

        this.updateBalanceUI();
        this.updateControls();
    }
};

export default BlackjackGame;

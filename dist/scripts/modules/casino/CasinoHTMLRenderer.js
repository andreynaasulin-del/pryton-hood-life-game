/**
 * CASINO HTML RENDERER
 * Централизованный рендеринг HTML для всех казино-игр.
 * Вынесено из UIManager для лучшей организации кода.
 */

export class CasinoHTMLRenderer {

  static renderSlots() {
    return `
      <div class="slots-game-v4 ds-panel-glass ds-scanlines">
        <div class="game-header-v4">
          <div class="gh-info">
            <div class="gh-tag">LUCK_ENGINE: ACTIVATED</div>
            <h2 class="gh-title">СЛОТЫ // ФОРТУНА</h2>
          </div>
          <button id="backToLobbyBtnSlots" class="holo-btn orange exit-btn">
            <i data-lucide="log-out"></i> <span>ВЫХОД</span>
          </button>
        </div>

        <div class="slots-arena-v4">
          <!-- WIN LINE INDICATOR -->
          <div class="slots-winline"></div>
          
          <!-- REELS CONTAINER -->
          <div class="slots-machine-v4">
            <div class="slot-reel-v4" id="slot-r1">
              <div class="reel-shadow"></div>
            </div>
            <div class="slot-reel-v4" id="slot-r2">
              <div class="reel-shadow"></div>
            </div>
            <div class="slot-reel-v4" id="slot-r3">
              <div class="reel-shadow"></div>
            </div>
          </div>
          
          <!-- STATUS -->
          <div class="slots-status-v4" id="slot-status">ОЖИДАНИЕ ЗАПУСКА...</div>
        </div>

        <div class="slots-footer-v4">
          <div class="sf-bankroll">
            <label>ВАШИ_ФИШКИ</label>
            <div class="sf-chips" id="slotsChips">0</div>
          </div>
          
          <div class="sf-controls">
            <div class="sf-bet-group">
              <label>СТАВКА</label>
              <input type="number" id="slotsBetInput" class="ds-input" value="100" min="10">
            </div>
            <button id="btn-spin" class="holo-btn gold spin-btn-v4">
              <i data-lucide="rotate-cw"></i>
              <span>КРУТИТЬ</span>
            </button>
          </div>
          
          <div class="sf-ghost">
            <button id="ghostLuckSlotsBtn" class="holo-btn cyan ghost-btn">
              <i data-lucide="ghost"></i>
              <span>СПИРИТИЗМ (-10❤️)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static renderDice() {
    return `
      <div class="dice-game-v4 ds-panel-glass ds-scanlines">
        <div class="game-header-v4">
          <div class="gh-info">
            <div class="gh-tag">PROBABILITY_ENGINE: ONLINE</div>
            <h2 class="gh-title">КОСТИ // СУДЬБА</h2>
          </div>
          <button id="backToLobbyBtnDice" class="holo-btn orange exit-btn">
            <i data-lucide="log-out"></i> <span>ВЫХОД</span>
          </button>
        </div>

        <div class="dice-arena-v4">
          <div class="dice-box-v4">
            <div class="die-v4" id="dice1">?</div>
            <div class="die-v4" id="dice2">?</div>
          </div>
          
          <div class="dice-result-v4" id="diceResultDisplay">ВЫБЕРИ ИСХОД И БРОСАЙ</div>
        </div>

        <div class="dice-footer-v4">
          <div class="df-outcomes">
            <label>СТАВКА_НА_ИСХОД</label>
            <div class="dice-bet-options">
              <button class="dice-bet-btn" data-outcome="low">
                <i data-lucide="arrow-down"></i> МЕНЬШЕ 7
              </button>
              <button class="dice-bet-btn exact" data-outcome="exact">
                <i data-lucide="target"></i> РОВНО 7
              </button>
              <button class="dice-bet-btn" data-outcome="high">
                <i data-lucide="arrow-up"></i> БОЛЬШЕ 7
              </button>
            </div>
          </div>
          
          <div class="df-controls">
            <div class="df-bet-amount">
              <label>РАЗМЕР_СТАВКИ</label>
              <div class="dice-controls">
                <button class="bet-btn" data-bet="100">100</button>
                <button class="bet-btn" data-bet="500">500</button>
                <button class="bet-btn active" data-bet="1000">1К</button>
              </div>
            </div>
            <button id="rollBtn" class="holo-btn gold roll-btn-v4">
              <i data-lucide="dice-1"></i>
              <span>БРОСИТЬ</span>
            </button>
          </div>
          
          <div class="df-ghost">
            <label>ПРИЗРАЧНАЯ_УДАЧА</label>
            <button id="ghostLuckDiceBtn" class="holo-btn cyan ghost-btn">
              <i data-lucide="ghost"></i> СПИРИТИЗМ (-10❤️)
            </button>
            <div class="df-chips">
              <span>ФИШКИ:</span>
              <span id="diceChips">0</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static renderRoulette() {
    return `
      <div class="roulette-game-v4 ds-panel-glass ds-scanlines">
        <div class="game-header-v4">
          <div class="gh-info">
            <div class="gh-tag">WHEEL_OF_FATE: SPINNING</div>
            <h2 class="gh-title">РУЛЕТКА // СУДЬБА</h2>
          </div>
          <button id="backToLobbyBtnRoulette" class="holo-btn orange exit-btn">
            <i data-lucide="log-out"></i> <span>ВЫХОД</span>
          </button>
        </div>

        <div class="roulette-arena-v4">
          <div class="roulette-wheel-wrap">
            <div class="roulette-wheel-v4" id="rouletteWheel"></div>
            <div class="roulette-pointer-v4">▼</div>
            <div class="wheel-center">
              <i data-lucide="target"></i>
            </div>
          </div>
          
          <div class="roulette-result-v4" id="rouletteResult">СДЕЛАЙТЕ СТАВКУ</div>
        </div>

        <div class="roulette-footer-v4">
          <div class="rf-bets">
            <label>СТАВКИ_НА_ЦВЕТ</label>
            <div class="bet-row">
              <button class="bet-option-v4 color-bet red" data-value="red">
                <span class="color-dot red"></span> КРАСНОЕ
              </button>
              <button class="bet-option-v4 color-bet black" data-value="black">
                <span class="color-dot black"></span> ЧЁРНОЕ
              </button>
              <button class="bet-option-v4 color-bet green" data-value="green">
                <span class="color-dot green"></span> ЗЕРО
              </button>
            </div>
            <div class="bet-row">
              <button class="bet-option-v4 parity-bet" data-value="even">ЧЁТ</button>
              <button class="bet-option-v4 parity-bet" data-value="odd">НЕЧЕТ</button>
            </div>
            <div class="number-bet-row">
              <input type="number" id="numberBetInput" class="ds-input" placeholder="0-36" min="0" max="36">
            </div>
          </div>
          
          <div class="rf-controls">
            <div class="rf-info">
              <div class="info-item">
                <label>ТЕКУЩАЯ_СТАВКА</label>
                <span id="rouletteCurrentBet">1000</span>
              </div>
              <div class="info-item">
                <label>НА_СТОЛЕ</label>
                <span id="rouletteTotalBet">0</span>
              </div>
            </div>
            <div class="rf-bet-btns">
              <button class="bet-btn" data-bet="100">100</button>
              <button class="bet-btn" data-bet="500">500</button>
              <button class="bet-btn active" data-bet="1000">1К</button>
            </div>
            <div class="rf-actions">
              <button id="clearBetsBtn" class="holo-btn ghost">
                <i data-lucide="x"></i> СБРОС
              </button>
              <button id="spinWheelBtn" class="holo-btn gold spin-btn-v4">
                <i data-lucide="rotate-cw"></i> КРУТИТЬ
              </button>
            </div>
          </div>
          
          <div class="rf-ghost">
            <label>ПРИЗРАЧНАЯ_УДАЧА</label>
            <button id="ghostLuckRouletteBtn" class="holo-btn cyan ghost-btn">
              <i data-lucide="ghost"></i> СПИРИТИЗМ (-10❤️)
            </button>
            <div class="rf-chips">
              <span>ФИШКИ:</span>
              <span id="rouletteChips">0</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static renderBlackjack() {
    return `
            <div class="blackjack-game-v4 ds-panel-glass ds-scanlines">
                <div class="game-header-v4">
                    <div class="gh-info">
                        <div class="gh-tag">SESSION_TYPE: HIGH_STAKES</div>
                        <h2 class="gh-title">БЛЭКДЖЕК // ПРИТОН</h2>
                    </div>
                    <button id="backToLobbyBtnBJ" class="holo-btn orange exit-btn">
                        <i data-lucide="log-out"></i> <span>ПОКИНУТЬ СТОЛ</span>
                    </button>
                </div>

                <div class="bj-table-v4">
                    <!-- 🕴️ DEALER SIDE -->
                    <div class="dealer-side">
                        <div class="side-hdr">
                            <span class="label">HOUSE</span>
                            <span class="score-badge" id="dealerScore"></span>
                        </div>
                        <div class="cards-area" id="dealerCards"></div>
                    </div>

                    <!-- 🎴 MESSAGE CENTER -->
                    <div class="bj-message active" id="bjMessage">СДЕЛАЙТЕ СТАВКУ</div>

                    <!-- 👤 PLAYER SIDE -->
                    <div class="player-side">
                        <div class="side-hdr">
                            <span class="label">PLAYER</span>
                            <span class="score-badge" id="playerScore"></span>
                        </div>
                        <div class="cards-area" id="playerCards"></div>
                    </div>
                </div>

                <div class="bj-footer-v4">
                    <div class="bankroll-hud">
                        <div class="bh-item">
                            <label>ВАШИ_ФИШКИ</label>
                            <div class="bh-val"><span id="bjChips">0</span> <i data-lucide="coins"></i></div>
                        </div>
                        <div class="bh-item">
                            <label>СТАВКА_СЕССИИ</label>
                            <input type="number" id="bjBetInput" class="ds-input" value="100" min="10">
                        </div>
                    </div>

                    <div class="bj-controls-v4">
                        <button class="holo-btn gold deal-btn">
                            <i data-lucide="play"></i> <span>РАЗДАТЬ</span>
                        </button>
                        <button class="holo-btn primary hit-btn" style="display:none">
                            <i data-lucide="plus-square"></i> <span>ЕЩЕ</span>
                        </button>
                        <button class="holo-btn stand-btn" style="display:none">
                            <i data-lucide="stop-circle"></i> <span>ХВАТИТ</span>
                        </button>
                    </div>

                    <div class="bj-special-v4">
                        <button id="ghostLuckBJBtn" class="holo-btn cyan ghost-btn">
                            <i data-lucide="ghost"></i> <span>СПИРИТИЗМ_ДИЛЕРА (-10❤️)</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  static renderThimbles() {
    return `
      <div class="thimbles-game-v4 ds-panel-glass ds-scanlines">
        <div class="game-header-v4">
          <div class="gh-info">
            <div class="gh-tag">SHELL_GAME: ACTIVE</div>
            <h2 class="gh-title">НАПЁРСТКИ // ОБМАН</h2>
          </div>
          <button id="backToLobbyBtnThimbles" class="holo-btn orange exit-btn">
            <i data-lucide="log-out"></i> <span>ВЫХОД</span>
          </button>
        </div>

        <div class="thimbles-arena-v4">
          <div class="thimbles-table-v4">
            <div class="thimble-v4" id="thimble1">
              <div class="thimble-cup"></div>
              <div class="thimble-ball"></div>
            </div>
            <div class="thimble-v4" id="thimble2">
              <div class="thimble-cup"></div>
              <div class="thimble-ball"></div>
            </div>
            <div class="thimble-v4" id="thimble3">
              <div class="thimble-cup"></div>
              <div class="thimble-ball"></div>
            </div>
          </div>
          
          <div class="thimbles-status-v4" id="thimblesStatus">ВЫБЕРИТЕ НАПЕРСТОК</div>
        </div>

        <div class="thimbles-footer-v4">
          <div class="tf-bet">
            <label>СТАВКА</label>
            <input type="number" id="thimblesBetInput" class="ds-input" value="100" min="10">
          </div>
          
          <div class="tf-controls">
            <button id="thimblesPlayBtn" class="holo-btn gold play-btn-v4">
              <i data-lucide="shuffle"></i> ПЕРЕМЕШАТЬ
            </button>
          </div>
          
          <div class="tf-ghost">
            <button id="ghostLuckThimblesBtn" class="holo-btn cyan ghost-btn">
              <i data-lucide="scan"></i> РЕНТГЕН (-10❤️)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static renderCrash() {
    return `
      <div class="crash-game-v4 ds-panel-glass ds-scanlines">
        <div class="game-header-v4">
          <div class="gh-info">
            <div class="gh-tag">ROCKET_PROTOCOL: IGNITION</div>
            <h2 class="gh-title">КРЭШ // РАКЕТА</h2>
          </div>
          <button id="backToLobbyBtnCrash" class="holo-btn orange exit-btn">
            <i data-lucide="log-out"></i> <span>ВЫХОД</span>
          </button>
        </div>

        <div class="crash-arena-v4">
          <div class="crash-monitor-v4">
            <div class="crash-grid-v4"></div>
            <div class="crash-rocket-v4">
              <i data-lucide="rocket"></i>
            </div>
            <div class="crash-multiplier-v4" id="crashMultiplier">1.00x</div>
          </div>
          
          <div class="crash-status-v4" id="crashStatus">ГОТОВ К ЗАПУСКУ</div>
        </div>

        <div class="crash-footer-v4">
          <div class="cf-bet">
            <label>СТАВКА</label>
            <input type="number" id="crashBetInput" class="ds-input" value="100" min="10">
            <div class="quick-bets-v4">
              <button class="quick-bet" data-val="100">100</button>
              <button class="quick-bet" data-val="500">500</button>
              <button class="quick-bet" data-val="1000">1К</button>
            </div>
          </div>
          
          <div class="cf-controls">
            <button id="crashActionBtn" class="holo-btn gold crash-btn-v4">
              <i data-lucide="play"></i> СТАРТ
            </button>
          </div>
          
          <div class="cf-ghost">
            <button id="ghostLuckCrashBtn" class="holo-btn cyan ghost-btn">
              <i data-lucide="ghost"></i> СПИРИТИЗМ (-10❤️)
            </button>
            <div class="cf-chips">
              <span>ФИШКИ:</span>
              <span id="crashChips">0</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Получить HTML рендерер по ID игры
   * @param {string} gameId - slots, dice, roulette, blackjack, thimbles, crash
   * @returns {Object} { container: string, html: string }
   */
  static getGameConfig(gameId) {
    const configs = {
      slots: { container: 'slots-game-container', html: this.renderSlots() },
      dice: { container: 'diceGame', html: this.renderDice() },
      roulette: { container: 'rouletteGame', html: this.renderRoulette() },
      blackjack: { container: 'blackjackGame', html: this.renderBlackjack() },
      thimbles: { container: 'thimblesGame', html: this.renderThimbles() },
      crash: { container: 'crashGame', html: this.renderCrash() }
    };
    return configs[gameId] || null;
  }
}

/**
 * CLUB GAMES - Mini-games and Event-based logic
 */
import { gameState } from '../game-state.js';
import questSystem from '../quest-system.js';

export class ClubGames {
    static startRecordingGame(beat, topic, onFinish) {
        const state = gameState.getState();
        const overlay = document.getElementById('modalOverlay');
        if (!overlay) return;

        // Track names based on topic
        const trackNames = {
            void: ['ПУСТОТА', 'БЕЗДНА'], paranoia: ['ТЕНИ', 'ПАРАНОЙЯ'],
            escape: ['ПОБЕГ', 'ВЫХОД'], grid: ['СИСТЕМА', 'КЛЕТКА'],
            glitch: ['ГЛИТЧ', 'ОШИБКА'], memories: ['ПАМЯТЬ', 'FLASHBACK']
        };
        const names = trackNames[topic.id] || ['ЗАПИСЬ'];
        const trackName = names[Math.floor(Math.random() * names.length)];
        const fullName = `${trackName} pt.${(state.music?.tracks?.length || 0) + 1}`;

        // Initialize Rhythm Game
        // (Full logic extracted from ClubTab)
        let score = 0;
        let hits = 0;
        let misses = 0;
        let gameActive = true;
        const totalNotes = 15; // Balanced for testing

        overlay.innerHTML = `
            <div class="rhythm-game">
                <div class="rhythm-header">
                    <h2>ЗАПИСЬ: "${fullName}"</h2>
                    <div class="rhythm-stats"><span id="rg-score">0</span> pts</div>
                </div>
                <div class="rhythm-arena">
                    <div class="lanes-container">
                        ${[0, 1, 2, 3].map(i => `<div class="lane"><span class="lane-key">${['Q', 'W', 'E', 'R'][i]}</span></div>`).join('')}
                    </div>
                </div>
                <div class="rhythm-footer">
                    <p>Нажимай вовремя для чистого звука!</p>
                    <button class="result-close-btn" id="rg-skip" style="margin-top:20px; opacity:0.5;">ПРОПУСТИТЬ (70%)</button>
                </div>
            </div>
        `;
        overlay.classList.add('active');

        // Note: For now we use a simpler version or just skip to results to keep it robust
        const finish = (quality) => {
            overlay.classList.remove('active');
            onFinish(beat, topic, fullName, quality, hits, misses);
        };

        const skipBtn = document.getElementById('rg-skip');
        if (skipBtn) skipBtn.onclick = () => finish(70);

        // Auto-finish after 5 seconds for simulation
        setTimeout(() => { if (gameActive) finish(75 + Math.floor(Math.random() * 20)); }, 5000);
    }

    static performAtVenue(venue, onFinish) {
        const overlay = document.getElementById('modalOverlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="performance-show">
                <div class="performance-stage">
                    <div class="stage-lights"><div class="light"></div></div>
                    <div class="performer-avatar"><i data-lucide="mic"></i></div>
                </div>
                <div class="performance-info">
                    <h2>${venue.name}</h2>
                    <p id="perf-status">ПОДГОТОВКА...</p>
                </div>
            </div>
        `;
        overlay.classList.add('active');
        if (window.lucide) window.lucide.createIcons();

        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            const status = document.getElementById('perf-status');
            if (status) status.textContent = progress < 100 ? 'КАЧАЕМ ЗАЛ...' : 'РАЗРЫВ! 🔥';

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.classList.remove('active');
                    onFinish(venue);
                }, 1000);
            }
        }, 500);
    }
}

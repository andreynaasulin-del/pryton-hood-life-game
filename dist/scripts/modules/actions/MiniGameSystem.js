import { gameState } from '../game-state.js';
import { windowManager } from '../core/WindowManager.js';

export class MiniGameSystem {
    constructor(callbacks) {
        this.onComplete = callbacks.onComplete;
    }

    start(action) {
        if (action.miniGame === 'beat') return this.startBeatMaker(action);
        if (action.miniGame === 'hacking') return this.startHacking(action);
        if (action.miniGame === 'cooking') return this.startCooking(action);
        if (action.miniGame === 'atm') return this.startAtmHack(action);
        return false;
    }

    startBeatMaker(action) {
        import('../beat-maker.js').then(({ BeatMaker }) => {
            const game = new BeatMaker();
            game.init((result) => this.onComplete(result));
        });
    }

    startHacking(action) {
        import('../hacking-game.js').then(({ HackingGame }) => {
            const game = new HackingGame();
            game.init((result) => this.onComplete(result));
        });
    }

    startCooking(action) {
        import('../cooking-game.js').then(({ CookingGame }) => {
            const game = new CookingGame();
            game.init((result) => this.onComplete(result));
        });
    }

    startAtmHack(action) {
        // ATM hacking game logic wrapper
        const content = `<div id="atmHack" class="atm-mini-game">Взломай код: 0000</div>`;
        windowManager.showModal('ВЗЛОМ БАНКОМАТА', content, [
            { text: 'ВЗЛОМАТЬ', action: () => this.onComplete({ success: Math.random() > 0.5 }) }
        ]);
    }
}

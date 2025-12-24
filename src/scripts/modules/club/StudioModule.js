/**
 * STUDIO MODULE - Recording Logic
 * Логика записи треков в студии
 */

import { gameState } from '../game-state.js';
import { ClubData } from './ClubData.js';
import { Utils } from '../utils.js';

export class StudioModule {
    constructor() {
        this.selectedBeat = null;
        this.selectedTopic = null;
        this.selectedCollab = null;
    }

    selectBeat(beatId) {
        const beat = ClubData.beats.find(b => b.id === beatId);
        if (!beat) return false;

        const state = gameState.getState();
        if (state.kpis.cash < beat.price) return false;

        this.selectedBeat = beatId;
        return true;
    }

    selectTopic(topicId) {
        const topic = ClubData.topics.find(t => t.id === topicId);
        if (!topic) return false;

        this.selectedTopic = topicId;
        return true;
    }

    selectCollab(collabId) {
        if (collabId === 'none') {
            this.selectedCollab = null;
            return true;
        }

        const collab = ClubData.collabArtists.find(c => c.id === collabId);
        if (!collab) return false;

        const state = gameState.getState();
        const fame = state.music?.fame || 0;

        if (fame < collab.minFame) return false;
        if (state.kpis.cash < collab.price) return false;

        this.selectedCollab = collabId;
        return true;
    }

    canRecord() {
        const state = gameState.getState();
        return this.selectedBeat &&
            this.selectedTopic &&
            (state.stats?.energy || 0) >= 30;
    }

    recordTrack() {
        if (!this.canRecord()) return null;

        const state = gameState.getState();
        const beat = ClubData.beats.find(b => b.id === this.selectedBeat);
        const topic = ClubData.topics.find(t => t.id === this.selectedTopic);
        const collab = this.selectedCollab ?
            ClubData.collabArtists.find(c => c.id === this.selectedCollab) : null;

        // Calculate quality
        const baseQuality = 40 + (state.stats?.creativity || 50);
        const collabBonus = collab ? collab.qualityBonus : 0;
        const quality = Utils.clamp(baseQuality + collabBonus, 0, 100);

        // Calculate viral chance
        const baseViral = 0.05;
        const collabViralBonus = collab ? collab.viralBonus : 0;
        const viralChance = baseViral + collabViralBonus;
        const isViral = Math.random() < viralChance;

        // Create track
        const track = {
            id: Date.now(),
            title: this.generateTrackTitle(topic, beat),
            beat: beat.name,
            topic: topic.name,
            quality,
            plays: 0,
            fans: 0,
            viral: isViral,
            collab: collab ? collab.name : null,
            timestamp: Date.now()
        };

        // Calculate costs
        const beatCost = beat.price;
        const collabCost = collab ? collab.price : 0;
        const totalCost = beatCost + collabCost;

        // Update game state
        const tracks = state.music?.tracks || [];
        tracks.push(track);

        gameState.updateState({
            stats: {
                ...state.stats,
                energy: state.stats.energy - 30
            },
            kpis: {
                ...state.kpis,
                cash: state.kpis.cash - totalCost
            },
            music: {
                ...state.music,
                tracks,
                currentBeat: null,
                currentTopic: null
            }
        });

        // Reset selections
        this.selectedBeat = null;
        this.selectedTopic = null;
        this.selectedCollab = null;

        // Add initial plays/fans
        setTimeout(() => {
            this.addInitialStats(track.id, quality, isViral);
        }, 100);

        return track;
    }

    addInitialStats(trackId, quality, isViral) {
        const state = gameState.getState();
        const tracks = state.music?.tracks || [];
        const track = tracks.find(t => t.id === trackId);

        if (!track) return;

        // Initial plays based on quality
        const basePlays = Math.floor(quality * 10);
        const viralMultiplier = isViral ? 5 : 1;
        track.plays = basePlays * viralMultiplier;

        // Initial fans (10% of plays)
        track.fans = Math.floor(track.plays * 0.1);

        gameState.updateState({
            music: {
                ...state.music,
                tracks,
                fans: (state.music?.fans || 0) + track.fans
            }
        });
    }

    generateTrackTitle(topic, beat) {
        const prefixes = ['', 'Малый', 'Дух', 'Тень', 'Эхо', 'Призрак'];
        const suffixes = ['', '(prod.)', 'freestyle', 'demo'];

        const prefix = Utils.randomElement(prefixes);
        const suffix = Utils.randomElement(suffixes);

        let title = topic.name;
        if (prefix) title = `${prefix} ${title}`;
        if (suffix) title = `${title} ${suffix}`;

        return title;
    }

    getSelectedBeat() {
        return this.selectedBeat;
    }

    getSelectedTopic() {
        return this.selectedTopic;
    }

    getSelectedCollab() {
        return this.selectedCollab;
    }

    reset() {
        this.selectedBeat = null;
        this.selectedTopic = null;
        this.selectedCollab = null;
    }
}

/**
 * CHARTS MODULE - Promotion & Charts Logic
 * Логика продвижения и чартов
 */

import { gameState } from '../game-state.js';
import { ClubData } from './ClubData.js';
import { Utils } from '../utils.js';

export class ChartsModule {
    constructor() {
        // No state needed
    }

    getTracks() {
        const state = gameState.getState();
        return state.music?.tracks || [];
    }

    getTopTracks(limit = 10) {
        return this.getTracks()
            .sort((a, b) => b.plays - a.plays)
            .slice(0, limit);
    }

    promoteOnRadio(trackId, stationId) {
        const station = ClubData.radioStations.find(s => s.id === stationId);
        if (!station) return false;

        const state = gameState.getState();
        const tracks = state.music?.tracks || [];
        const track = tracks.find(t => t.id === trackId);

        if (!track) return false;
        if (state.kpis.cash < station.cost) return false;

        const fame = state.music?.fame || 0;
        if (fame < station.minFame) return false;

        // Add plays and fans
        track.plays += station.playsBoost;
        track.fans += station.fansBoost;

        // Update state
        gameState.updateState({
            kpis: {
                ...state.kpis,
                cash: state.kpis.cash - station.cost
            },
            music: {
                ...state.music,
                tracks,
                fans: (state.music?.fans || 0) + station.fansBoost
            }
        });

        return true;
    }

    shootClip(trackId) {
        const clipCost = 1500;
        const state = gameState.getState();

        if (state.kpis.cash < clipCost) return false;

        const tracks = state.music?.tracks || [];
        const track = tracks.find(t => t.id === trackId);

        if (!track) return false;
        if (track.hasClip) return false;

        // Clip boosts plays significantly
        const clipBoost = Math.floor(track.quality * 100);
        track.plays += clipBoost;
        track.fans += Math.floor(clipBoost * 0.2);
        track.hasClip = true;

        gameState.updateState({
            kpis: {
                ...state.kpis,
                cash: state.kpis.cash - clipCost
            },
            music: {
                ...state.music,
                tracks,
                fans: (state.music?.fans || 0) + Math.floor(clipBoost * 0.2)
            }
        });

        return true;
    }

    createAlbum(name, trackIds) {
        if (!name || trackIds.length < 3) return false;

        const state = gameState.getState();
        const tracks = state.music?.tracks || [];

        // Verify all tracks exist
        const selectedTracks = trackIds.map(id =>
            tracks.find(t => t.id === id)
        );

        if (selectedTracks.some(t => !t)) return false;

        // Create album
        const album = {
            id: Date.now(),
            name,
            tracks: trackIds,
            totalPlays: selectedTracks.reduce((sum, t) => sum + t.plays, 0),
            avgQuality: Math.floor(
                selectedTracks.reduce((sum, t) => sum + t.quality, 0) / selectedTracks.length
            ),
            timestamp: Date.now()
        };

        const albums = state.music?.albums || [];
        albums.push(album);

        gameState.updateState({
            music: {
                ...state.music,
                albums
            }
        });

        return album;
    }

    calculateTrackIncome(track) {
        if (!track) return 0;

        // Revenue per 1000 plays
        const baseRevenue = 50;
        const qualityMultiplier = 1 + (track.quality / 100);
        const viralMultiplier = track.viral ? 2 : 1;

        const revenue = Math.floor(
            (track.plays / 1000) * baseRevenue * qualityMultiplier * viralMultiplier
        );

        return revenue;
    }

    collectAllIncome() {
        const tracks = this.getTracks();
        const totalIncome = tracks.reduce((sum, track) => {
            return sum + this.calculateTrackIncome(track);
        }, 0);

        if (totalIncome === 0) return 0;

        const state = gameState.getState();
        gameState.updateState({
            kpis: {
                ...state.kpis,
                cash: state.kpis.cash + totalIncome
            }
        });

        // Reset track plays after collecting
        tracks.forEach(track => {
            track.plays = Math.floor(track.plays * 0.1); // Keep 10% momentum
        });

        gameState.updateState({
            music: {
                ...state.music,
                tracks
            }
        });

        return totalIncome;
    }

    getViralTracks() {
        return this.getTracks().filter(t => t.viral);
    }

    getStats() {
        const tracks = this.getTracks();

        return {
            totalTracks: tracks.length,
            totalPlays: tracks.reduce((sum, t) => sum + t.plays, 0),
            totalFans: tracks.reduce((sum, t) => sum + t.fans, 0),
            viralTracks: tracks.filter(t => t.viral).length,
            avgQuality: tracks.length > 0
                ? Math.floor(tracks.reduce((sum, t) => sum + t.quality, 0) / tracks.length)
                : 0
        };
    }
}

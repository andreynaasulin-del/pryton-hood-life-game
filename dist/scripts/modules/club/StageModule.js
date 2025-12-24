/**
 * STAGE MODULE - Live Performances Logic
 * Логика живых выступлений
 */

import { gameState } from '../game-state.js';
import { ClubData } from './ClubData.js';

export class StageModule {
    constructor() {
        // Performance state
    }

    getVenues() {
        return ClubData.venues;
    }

    canPerform(venueId, currentSeason) {
        const venue = ClubData.venues.find(v => v.id === venueId);
        if (!venue) return false;

        const state = gameState.getState();
        const fame = state.music?.fame || 0;
        const energy = state.stats?.energy || 0;
        const cash = state.kpis?.cash || 0;

        // Check requirements
        if (fame < venue.minFame) return false;
        if (energy < venue.energy) return false;
        if (cash < venue.cost) return false;

        // Check seasonal requirement
        if (venue.seasonal && venue.seasonal !== currentSeason) {
            return false;
        }

        return true;
    }

    perform(venueId) {
        const venue = ClubData.venues.find(v => v.id === venueId);
        if (!venue) return null;

        const state = gameState.getState();

        // Deduct costs
        const newEnergy = state.stats.energy - venue.energy;
        const newCash = state.kpis.cash - venue.cost;

        // Calculate earnings based on fame and quality
        const basePayout = Math.floor(venue.fame * 10);
        const fameBonus = Math.floor((state.music?.fame || 0) * 0.1);
        const totalPayout = basePayout + fameBonus;

        // Update state
        gameState.updateState({
            stats: {
                ...state.stats,
                energy: newEnergy
            },
            kpis: {
                ...state.kpis,
                cash: newCash + totalPayout
            },
            music: {
                ...state.music,
                fame: (state.music?.fame || 0) + venue.fame,
                performances: (state.music?.performances || 0) + 1
            }
        });

        return {
            venue: venue.name,
            famEarned: venue.fame,
            cashEarned: totalPayout,
            energySpent: venue.energy
        };
    }

    getAvailableVenues(currentSeason) {
        const state = gameState.getState();
        const fame = state.music?.fame || 0;
        const energy = state.stats?.energy || 0;
        const cash = state.kpis?.cash || 0;

        return ClubData.venues.filter(venue => {
            // Check basic requirements
            const meetsRequirements =
                fame >= venue.minFame &&
                energy >= venue.energy &&
                cash >= venue.cost;

            // Check seasonal
            const isSeasonal = venue.seasonal;
            const isCorrectSeason = !isSeasonal || venue.seasonal === currentSeason;

            return meetsRequirements && isCorrectSeason;
        });
    }

    getPerformanceStats() {
        const state = gameState.getState();

        return {
            totalPerformances: state.music?.performances || 0,
            currentFame: state.music?.fame || 0,
            currentEnergy: state.stats?.energy || 0
        };
    }

    getUnlockedVenues() {
        const state = gameState.getState();
        const fame = state.music?.fame || 0;

        return ClubData.venues.filter(venue => fame >= venue.minFame);
    }

    getLockedVenues() {
        const state = gameState.getState();
        const fame = state.music?.fame || 0;

        return ClubData.venues.filter(venue => fame < venue.minFame);
    }

    getProgressToUnlock(venueId) {
        const venue = ClubData.venues.find(v => v.id === venueId);
        if (!venue) return 0;

        const state = gameState.getState();
        const fame = state.music?.fame || 0;

        if (fame >= venue.minFame) return 100;

        return Math.min(100, Math.floor((fame / venue.minFame) * 100));
    }
}

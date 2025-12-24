/**
 * LABEL MODULE - Record Label Logic
 * Логика лейблов и контрактов
 */

import { gameState } from '../game-state.js';
import { ClubData } from './ClubData.js';

export class LabelModule {
    constructor() {
        // Current label state
    }

    getCurrentLabel() {
        const state = gameState.getState();
        const labelId = state.music?.currentLabel;
        if (!labelId) return null;

        return ClubData.labels.find(l => l.id === labelId);
    }

    canSignLabel(labelId) {
        const label = ClubData.labels.find(l => l.id === labelId);
        if (!label) return false;

        const state = gameState.getState();
        const fame = state.music?.fame || 0;
        const tracks = state.music?.tracks || [];

        // Check requirements
        if (fame < label.minFame) return false;
        if (tracks.length < label.minTracks) return false;

        // Can't sign if already signed
        if (state.music?.currentLabel) return false;

        return true;
    }

    signLabel(labelId) {
        if (!this.canSignLabel(labelId)) return false;

        const label = ClubData.labels.find(l => l.id === labelId);
        const state = gameState.getState();

        // Sign the label
        gameState.updateState({
            kpis: {
                ...state.kpis,
                cash: state.kpis.cash + label.signBonus
            },
            music: {
                ...state.music,
                currentLabel: labelId,
                labelSignedAt: Date.now()
            }
        });

        return true;
    }

    getLabelMultiplier() {
        const label = this.getCurrentLabel();
        return label ? label.fameMultiplier : 1.0;
    }

    addFame(amount) {
        const multiplier = this.getLabelMultiplier();
        const finalAmount = Math.floor(amount * multiplier);

        const state = gameState.getState();
        gameState.updateState({
            music: {
                ...state.music,
                fame: (state.music?.fame || 0) + finalAmount
            }
        });

        return finalAmount;
    }

    calculateRoyalties() {
        const label = this.getCurrentLabel();
        if (!label) return 0;

        const state = gameState.getState();
        const tracks = state.music?.tracks || [];

        // Calculate total income from tracks
        let totalIncome = 0;
        tracks.forEach(track => {
            const revenue = Math.floor((track.plays / 1000) * 50);
            totalIncome += revenue;
        });

        // Label takes their cut
        const royalties = Math.floor(totalIncome * label.royaltyRate);
        return royalties;
    }

    leaveLabel() {
        const label = this.getCurrentLabel();
        if (!label) return false;

        // Penalty for leaving
        const penalty = label.signBonus;

        const state = gameState.getState();

        // Can't leave if can't afford penalty
        if (state.kpis.cash < penalty) return false;

        gameState.updateState({
            kpis: {
                ...state.kpis,
                cash: state.kpis.cash - penalty
            },
            music: {
                ...state.music,
                currentLabel: null,
                labelSignedAt: null
            }
        });

        return true;
    }

    getAvailableLabels() {
        const state = gameState.getState();
        const fame = state.music?.fame || 0;
        const tracks = state.music?.tracks || [];

        return ClubData.labels.filter(label => {
            return fame >= label.minFame && tracks.length >= label.minTracks;
        });
    }

    getLabelStatus() {
        const label = this.getCurrentLabel();
        if (!label) {
            return {
                signed: false,
                label: null,
                multiplier: 1.0,
                royaltyRate: 0
            };
        }

        return {
            signed: true,
            label: label.name,
            tier: label.tier,
            multiplier: label.fameMultiplier,
            royaltyRate: label.royaltyRate,
            signBonus: label.signBonus
        };
    }
}

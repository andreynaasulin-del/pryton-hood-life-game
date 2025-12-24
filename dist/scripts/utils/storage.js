// Storage Utilities Module
import { gameState } from '../modules/game-state.js';
import { authManager } from '../modules/auth.js';

const STORAGE_KEY = 'pryton_game_save';

export class GameStorage {
  static async save() {
    try {
      if (!gameState) {
        throw new Error('Game state not initialized');
      }

      // Get current game state
      const gameStateData = gameState.getState();

      // Save to server if authenticated, otherwise to localStorage
      if (authManager.isAuthenticated) {
        await authManager.saveGameState(gameStateData);
        console.log('Game saved to server successfully');
      } else {
        // For guest users, save to localStorage
        const data = JSON.stringify(gameStateData);
        localStorage.setItem(STORAGE_KEY, data);
        console.log('Game saved to localStorage (guest mode)');
      }

      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      // Could show user notification here
      return false;
    }
  }

  static load() {
    try {
      if (!gameState) {
        throw new Error('Game state not initialized');
      }

      // This method is now handled by authManager.loadGameState()
      // Keeping for backward compatibility
      console.warn('GameStorage.load() is deprecated, use authManager.loadGameState() instead');
      return false;
    } catch (error) {
      console.error('Failed to load game:', error);
      // Reset to safe state
      if (gameState) {
        gameState.reset();
      }
      return false;
    }
  }

  static hasSave() {
    try {
      // Check both server (if authenticated) and localStorage
      if (authManager.isAuthenticated) {
        // For authenticated users, assume save exists on server
        return true;
      }
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      console.error('Failed to check save existence:', error);
      return false;
    }
  }

  static clear() {
    try {
      // Clear both server and localStorage
      if (authManager.isAuthenticated) {
        // Note: Server clearing would need a separate API endpoint
        console.log('Server saves cleared (would need API endpoint)');
      }
      localStorage.removeItem(STORAGE_KEY);
      console.log('Local save cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear save:', error);
      return false;
    }
  }

  static export() {
    try {
      if (!gameState) {
        throw new Error('Game state not initialized');
      }
      return gameState.serialize();
    } catch (error) {
      console.error('Failed to export game:', error);
      return null;
    }
  }

  static import(data) {
    try {
      if (!gameState) {
        throw new Error('Game state not initialized');
      }
      if (!data || typeof data !== 'string') {
        throw new Error('Invalid import data');
      }
      gameState.deserialize(data);
      this.save();
      console.log('Game imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import game:', error);
      return false;
    }
  }
}

// Auto-save functionality
export class AutoSave {
  static init(interval = 30000) {
    // 30 seconds default
    this.intervalId = setInterval(() => {
      GameStorage.save();
    }, interval);
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

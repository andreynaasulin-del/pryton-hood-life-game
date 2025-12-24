// Story System Module - Legacy stub for backward compatibility
// All story logic is now centralized in main.js runScriptedEvents()

class StorySystem {
  constructor() {
    // Empty constructor for compatibility
  }

  // Minimal triggerEvent for debug purposes only
  triggerEvent(event) {
    console.warn(
      'storySystem.triggerEvent is deprecated. Use runScriptedEvents in main.js instead.'
    );

    // Basic implementation for debug compatibility
    import('./ui-manager.js').then((module) => {
      const uiManager = module.default;
      const choices = event.choices
        ? event.choices.map((choice) => ({
          text: choice.text,
          action: () => {
            uiManager.hideModal();
          }
        }))
        : [{ text: 'OK', action: () => uiManager.hideModal() }];

      uiManager.showModal(
        event.title || 'Debug Event',
        event.description || 'Debug event triggered',
        choices
      );
    });
  }

  // Stub methods for compatibility
  hasSeenEvent() {
    return false;
  }

  getStoryProgress() {
    return { seenEvents: 0, totalEvents: 0, firstActionDone: false };
  }
}

// Export stub instance
const storySystem = new StorySystem();
export default storySystem;

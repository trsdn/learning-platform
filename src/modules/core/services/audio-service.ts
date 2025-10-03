/**
 * Audio Service
 * Handles playback of Spanish pronunciation audio files
 */

interface AudioManifest {
  [spanishText: string]: string; // Maps Spanish text to audio filename
}

class AudioService {
  private manifest: AudioManifest | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private manifestPath = '/audio/spanish/manifest.json';
  private audioBasePath = '/audio/spanish/';
  private isInitialized = false;
  private currentlyPlaying: HTMLAudioElement | null = null;

  /**
   * Initialize the audio service by loading the manifest
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const response = await fetch(this.manifestPath);
      if (!response.ok) {
        throw new Error(`Failed to load audio manifest: ${response.statusText}`);
      }

      this.manifest = await response.json();
      this.isInitialized = true;
      console.log('✓ Audio service initialized with', Object.keys(this.manifest || {}).length, 'audio files');
    } catch (error) {
      console.warn('⚠️ Failed to initialize audio service:', error);
      this.manifest = {};
      this.isInitialized = true; // Mark as initialized even on error to prevent retry loops
    }
  }

  /**
   * Play audio for Spanish text
   * @param text - The Spanish text to pronounce
   * @returns Promise that resolves when audio finishes playing
   */
  async playSpanish(text: string): Promise<void> {
    // Ensure initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if audio file exists in manifest
    if (!this.manifest || !this.manifest[text]) {
      console.warn(`⚠️ No audio file found for: "${text}"`);
      throw new Error(`Audio not available for: ${text}`);
    }

    const filename = this.manifest[text];
    const audioPath = this.audioBasePath + filename;

    // Stop any currently playing audio
    if (this.currentlyPlaying) {
      this.currentlyPlaying.pause();
      this.currentlyPlaying.currentTime = 0;
    }

    // Get or create audio element
    let audio = this.audioCache.get(audioPath);
    if (!audio) {
      audio = new Audio(audioPath);
      this.audioCache.set(audioPath, audio);
    }

    // Play the audio
    this.currentlyPlaying = audio;

    return new Promise((resolve, reject) => {
      if (!audio) {
        reject(new Error('Audio element not found'));
        return;
      }

      const handleEnded = () => {
        cleanup();
        this.currentlyPlaying = null;
        resolve();
      };

      const handleError = () => {
        cleanup();
        this.currentlyPlaying = null;
        reject(new Error(`Failed to play audio: ${audioPath}`));
      };

      const cleanup = () => {
        audio!.removeEventListener('ended', handleEnded);
        audio!.removeEventListener('error', handleError);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      // Reset and play
      audio.currentTime = 0;
      audio.play().catch((error) => {
        cleanup();
        this.currentlyPlaying = null;
        reject(error);
      });
    });
  }

  /**
   * Check if audio is available for given Spanish text
   * @param text - The Spanish text to check
   * @returns true if audio file exists
   */
  hasAudio(text: string): boolean {
    // If not initialized yet, initialize synchronously by checking if we expect this text
    // This is a workaround since hasAudio is called during render (can't be async)
    if (!this.isInitialized) {
      // Return false during initialization - buttons will appear after first render
      return false;
    }
    return Boolean(this.manifest && this.manifest[text]);
  }

  /**
   * Stop any currently playing audio
   */
  stopPlayback(): void {
    if (this.currentlyPlaying) {
      this.currentlyPlaying.pause();
      this.currentlyPlaying.currentTime = 0;
      this.currentlyPlaying = null;
    }
  }

  /**
   * Clear the audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
  }
}

// Export singleton instance
export const audioService = new AudioService();

// Export class for testing
export { AudioService };

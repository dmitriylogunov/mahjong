import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game.store';

export interface SoundConfiguration {
  [id: string]: string[];
}

interface SoundData {
  [id: string]: number;
}

class AudioService {
  private soundsReady = ref(false);
  private soundData: SoundData = {};
  private loadedSounds: Set<string> = new Set();
  private audioCache: Map<string, HTMLAudioElement[]> = new Map();
  private soundCount = 0;
  private loadedSoundsCount = 0;

  public getSoundsReady() {
    return computed(() => this.soundsReady.value);
  }

  public async load(soundConfiguration: SoundConfiguration): Promise<void> {
    this.soundCount = 0;
    this.loadedSoundsCount = 0;
    this.loadedSounds.clear();
    this.audioCache.clear();
    
    // Count total sounds
    for (const soundGroupId in soundConfiguration) {
      this.soundData[soundGroupId] = soundConfiguration[soundGroupId].length;
      this.soundCount += this.soundData[soundGroupId];
    }

    // Load all sounds
    const loadPromises: Promise<void>[] = [];
    
    for (const soundGroupId in soundConfiguration) {
      const sounds = soundConfiguration[soundGroupId];
      this.audioCache.set(soundGroupId, []);
      
      sounds.forEach((soundPath, index) => {
        const promise = this.loadSound(soundGroupId, index, soundPath);
        loadPromises.push(promise);
      });
    }

    await Promise.all(loadPromises);
    this.soundsReady.value = true;
  }

  private async loadSound(groupId: string, index: number, path: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      
      audio.addEventListener('canplaythrough', () => {
        const audioArray = this.audioCache.get(groupId) || [];
        audioArray[index] = audio;
        this.audioCache.set(groupId, audioArray);
        
        const soundId = `${groupId}${index}`;
        this.loadedSounds.add(soundId);
        this.loadedSoundsCount++;
        
        resolve();
      }, { once: true });

      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound: ${path}`);
        this.loadedSoundsCount++;
        resolve();
      }, { once: true });

      // Trigger load
      audio.load();
    });
  }

  public play(soundGroupId: string, delay: number = 0, repeat: boolean = false): void {
    const gameStore = useGameStore();
    
    // Check if sounds are enabled
    if (!gameStore.soundEnabled) {
      return;
    }

    const sounds = this.audioCache.get(soundGroupId);
    if (!sounds || sounds.length === 0) {
      return;
    }

    // Pick a random sound from the group
    const soundIndex = Math.floor(Math.random() * sounds.length);
    const audio = sounds[soundIndex];
    
    if (!audio) {
      return;
    }

    const playSound = () => {
      try {
        // Clone the audio element to allow multiple simultaneous plays
        const audioClone = audio.cloneNode() as HTMLAudioElement;
        audioClone.loop = repeat;
        audioClone.play().catch(err => {
          console.warn('Failed to play sound:', err);
        });
      } catch (err) {
        console.warn('Error playing sound:', err);
      }
    };

    if (delay > 0) {
      setTimeout(playSound, delay);
    } else {
      playSound();
    }
  }

  public stopAll(): void {
    this.audioCache.forEach(sounds => {
      sounds.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    });
  }
}

// Export singleton instance
export const audioService = new AudioService();
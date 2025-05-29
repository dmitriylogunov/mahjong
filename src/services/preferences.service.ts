import { ref, Ref, computed } from 'vue';
import { storageService } from './storage.service';

export interface UserPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hintsEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'classic' | 'modern' | 'dark';
  tileSet: 'traditional' | 'simple' | 'colorful';
}

class PreferencesService {
  private readonly PREFS_KEY = 'user_preferences';
  private readonly PREFS_STORE = 'preferences';
  
  private defaultPreferences: UserPreferences = {
    soundEnabled: true,
    musicEnabled: false,
    hintsEnabled: true,
    animationSpeed: 'normal',
    theme: 'classic',
    tileSet: 'traditional'
  };

  private preferences: Ref<UserPreferences>;

  constructor() {
    this.preferences = ref({ ...this.defaultPreferences });
    this.loadPreferences();
  }

  public getPreferences() {
    return computed(() => this.preferences.value);
  }

  public getCurrentPreferences(): UserPreferences {
    return { ...this.preferences.value };
  }

  public async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const updated = { ...this.preferences.value, ...updates };
    
    await storageService.save(this.PREFS_STORE, {
      key: this.PREFS_KEY,
      ...updated
    });
    
    this.preferences.value = updated;
    return updated;
  }

  public async resetPreferences(): Promise<UserPreferences> {
    return this.updatePreferences(this.defaultPreferences);
  }

  private async loadPreferences(): Promise<void> {
    try {
      const prefs = await storageService.get(this.PREFS_STORE, this.PREFS_KEY);
      if (prefs) {
        // Remove the 'key' property from stored object
        const { key, ...preferences } = prefs;
        this.preferences.value = { ...this.defaultPreferences, ...preferences };
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
    }
  }

  // Convenience methods
  public async toggleSound(): Promise<UserPreferences> {
    const current = this.getCurrentPreferences();
    return this.updatePreferences({ soundEnabled: !current.soundEnabled });
  }

  public async toggleMusic(): Promise<UserPreferences> {
    const current = this.getCurrentPreferences();
    return this.updatePreferences({ musicEnabled: !current.musicEnabled });
  }

  public async setTheme(theme: UserPreferences['theme']): Promise<UserPreferences> {
    return this.updatePreferences({ theme });
  }

  public async setAnimationSpeed(speed: UserPreferences['animationSpeed']): Promise<UserPreferences> {
    return this.updatePreferences({ animationSpeed: speed });
  }
}

// Export singleton instance
export const preferencesService = new PreferencesService();
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/do';

import { StorageService } from './storage.service';

export interface UserPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hintsEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'classic' | 'modern' | 'dark';
  tileSet: 'traditional' | 'simple' | 'colorful';
}

@Injectable()
export class PreferencesService {
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

  private preferences$ = new BehaviorSubject<UserPreferences>(this.defaultPreferences);

  constructor(private storage: StorageService) {
    this.loadPreferences();
  }

  public getPreferences(): Observable<UserPreferences> {
    return this.preferences$.asObservable();
  }

  public getCurrentPreferences(): UserPreferences {
    return this.preferences$.getValue();
  }

  public updatePreferences(updates: Partial<UserPreferences>): Observable<UserPreferences> {
    const current = this.preferences$.getValue();
    const updated = { ...current, ...updates };
    
    return this.storage.save(this.PREFS_STORE, {
      key: this.PREFS_KEY,
      ...updated
    }).do(() => {
      this.preferences$.next(updated);
    }).map(() => updated);
  }

  public resetPreferences(): Observable<UserPreferences> {
    return this.updatePreferences(this.defaultPreferences);
  }

  private loadPreferences(): void {
    this.storage.get(this.PREFS_STORE, this.PREFS_KEY)
      .subscribe(
        prefs => {
          if (prefs) {
            // Remove the 'key' property from stored object
            const { key, ...preferences } = prefs;
            this.preferences$.next({ ...this.defaultPreferences, ...preferences });
          }
        },
        error => {
          console.warn('Failed to load preferences:', error);
        }
      );
  }

  // Convenience methods
  public toggleSound(): Observable<UserPreferences> {
    const current = this.getCurrentPreferences();
    return this.updatePreferences({ soundEnabled: !current.soundEnabled });
  }

  public toggleMusic(): Observable<UserPreferences> {
    const current = this.getCurrentPreferences();
    return this.updatePreferences({ musicEnabled: !current.musicEnabled });
  }

  public setTheme(theme: UserPreferences['theme']): Observable<UserPreferences> {
    return this.updatePreferences({ theme });
  }

  public setAnimationSpeed(speed: UserPreferences['animationSpeed']): Observable<UserPreferences> {
    return this.updatePreferences({ animationSpeed: speed });
  }
}
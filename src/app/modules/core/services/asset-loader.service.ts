import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';

export interface AssetManifest {
  images: string[];
  sounds: string[];
  fonts: string[];
}

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
}

@Injectable()
export class AssetLoaderService {
  private loadedAssets = new Map<string, any>();
  private loadProgress$ = new Subject<LoadProgress>();
  
  // CDN configuration - can be set via environment variables
  private cdnBaseUrl = '';
  private useCDN = false;

  constructor() {}

  public configureCDN(baseUrl: string, enabled: boolean = true): void {
    this.cdnBaseUrl = baseUrl;
    this.useCDN = enabled;
  }

  public loadAssets(manifest: AssetManifest): Observable<boolean> {
    const totalAssets = 
      manifest.images.length + 
      manifest.sounds.length + 
      manifest.fonts.length;
    
    let loadedCount = 0;

    const imageLoaders = manifest.images.map(path => 
      this.loadImage(path).do(() => {
        loadedCount++;
        this.updateProgress(loadedCount, totalAssets, path);
      })
    );

    const soundLoaders = manifest.sounds.map(path => 
      this.loadSound(path).do(() => {
        loadedCount++;
        this.updateProgress(loadedCount, totalAssets, path);
      })
    );

    const fontLoaders = manifest.fonts.map(font => 
      this.loadFont(font).do(() => {
        loadedCount++;
        this.updateProgress(loadedCount, totalAssets, font);
      })
    );

    return Observable.forkJoin([
      ...imageLoaders,
      ...soundLoaders,
      ...fontLoaders
    ]).map(() => true)
    .catch(error => {
      console.error('Asset loading failed:', error);
      return Observable.of(false);
    });
  }

  public getLoadProgress(): Observable<LoadProgress> {
    return this.loadProgress$.asObservable();
  }

  public getAsset(path: string): any {
    return this.loadedAssets.get(path);
  }

  public preloadCriticalAssets(): Observable<boolean> {
    const criticalAssets: AssetManifest = {
      images: [
        '/img/tile.png',
        '/img/backgrounds/oriental-1.jpg'
      ],
      sounds: [
        '/sounds/click1.wav',
        '/sounds/coin1.wav'
      ],
      fonts: [
        'FreeSerifNF'
      ]
    };

    return this.loadAssets(criticalAssets);
  }

  private loadImage(path: string): Observable<HTMLImageElement> {
    return Observable.create((observer: any) => {
      const fullPath = this.getAssetPath(path);
      
      if (this.loadedAssets.has(fullPath)) {
        observer.next(this.loadedAssets.get(fullPath));
        observer.complete();
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.loadedAssets.set(fullPath, img);
        observer.next(img);
        observer.complete();
      };

      img.onerror = (error) => {
        observer.error(`Failed to load image: ${fullPath}`);
      };

      img.src = fullPath;
    });
  }

  private loadSound(path: string): Observable<HTMLAudioElement> {
    return Observable.create((observer: any) => {
      const fullPath = this.getAssetPath(path);
      
      if (this.loadedAssets.has(fullPath)) {
        observer.next(this.loadedAssets.get(fullPath));
        observer.complete();
        return;
      }

      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        this.loadedAssets.set(fullPath, audio);
        observer.next(audio);
        observer.complete();
      }, { once: true });

      audio.addEventListener('error', (error) => {
        observer.error(`Failed to load sound: ${fullPath}`);
      }, { once: true });

      audio.src = fullPath;
      audio.load();
    });
  }

  private loadFont(fontName: string): Observable<boolean> {
    return Observable.create((observer: any) => {
      // Check if font is already loaded
      if ((document as any).fonts && (document as any).fonts.check(`16px ${fontName}`)) {
        observer.next(true);
        observer.complete();
        return;
      }

      // Create a test element
      const testElement = document.createElement('span');
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.fontSize = '100px';
      testElement.style.fontFamily = `${fontName}, monospace`;
      testElement.textContent = 'BESbswy';
      document.body.appendChild(testElement);

      const startWidth = testElement.offsetWidth;
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max

      const checkFont = () => {
        if (testElement.offsetWidth !== startWidth || attempts >= maxAttempts) {
          document.body.removeChild(testElement);
          if (attempts >= maxAttempts) {
            observer.error(`Font loading timeout: ${fontName}`);
          } else {
            this.loadedAssets.set(`font:${fontName}`, true);
            observer.next(true);
            observer.complete();
          }
        } else {
          attempts++;
          setTimeout(checkFont, 100);
        }
      };

      checkFont();
    });
  }

  private getAssetPath(path: string): string {
    if (this.useCDN && this.cdnBaseUrl) {
      return `${this.cdnBaseUrl}${path}`;
    }
    return path;
  }

  private updateProgress(loaded: number, total: number, currentAsset: string): void {
    const progress: LoadProgress = {
      loaded,
      total,
      percentage: Math.round((loaded / total) * 100),
      currentAsset
    };
    this.loadProgress$.next(progress);
  }

  public clearCache(): void {
    this.loadedAssets.clear();
  }
}
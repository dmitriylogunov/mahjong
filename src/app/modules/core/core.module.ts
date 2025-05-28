import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

// Core services - singletons
import { StorageService } from './services/storage.service';
import { CacheService } from './services/cache.service';
import { PreferencesService } from './services/preferences.service';
import { AssetLoaderService } from './services/asset-loader.service';
import { GameRepository } from './repositories/game.repository';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    StorageService,
    CacheService,
    PreferencesService,
    AssetLoaderService,
    GameRepository
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
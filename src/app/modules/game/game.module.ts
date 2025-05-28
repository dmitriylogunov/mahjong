import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

// Game components
import { MjGameComponent } from '../../mj.game.component';
import { MjTileComponent } from '../../mj.tile.component';
import { MjTileFieldComponent } from '../../mj.tile.field.component';
import { MjStatusComponent } from '../../mj.status.component';

// Game services
import { MjGameControlService } from '../../services/mj.game.control.service';
import { MjAudioService } from '../../services/mj.audio.service';
import { GamePersistenceService } from './services/game-persistence.service';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    MjGameComponent,
    MjTileComponent,
    MjTileFieldComponent,
    MjStatusComponent
  ],
  providers: [
    MjGameControlService,
    MjAudioService,
    GamePersistenceService
  ],
  exports: [
    MjGameComponent
  ]
})
export class GameModule { }
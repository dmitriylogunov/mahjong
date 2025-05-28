import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Feature modules
import { CoreModule } from './modules/core/core.module';
import { SharedModule } from './modules/shared/shared.module';
import { GameModule } from './modules/game/game.module';

// Root component
import { MjGameComponent } from './mj.game.component';

@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    SharedModule,
    GameModule
  ],
  bootstrap: [MjGameComponent]
})
export class AppModule { }
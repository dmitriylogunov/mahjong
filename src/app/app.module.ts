import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MjGameComponent }  from './mj.game.component';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileFieldComponent } from './mj.tile.field.component';
import { MjTileComponent } from './mj.tile.component';
import { ModalComponent } from './app.modal.component';

import { IntAsTimePipe } from './pipes/int.as.time.pipe';
import { IntvalPipe } from './pipes/intval.pipe';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [
    MjGameComponent, MjStatusComponent, MJTileFieldComponent, MjTileComponent, ModalComponent,
    IntAsTimePipe, IntvalPipe
  ],
  bootstrap:    [ MjGameComponent ]
})
export class AppModule { }

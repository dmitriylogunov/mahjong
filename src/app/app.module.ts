import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MjGameComponent }  from './mj.game.component';
import { MjStatusComponent }  from './mj.status.component';
import { MjOptionsComponent }  from './mj.options.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';
import { MjTileComponent } from './mj.tile.component';
import { ModalComponent } from './app.modal.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MjGameComponent, MjStatusComponent, MJTileCollectionComponent, MjTileComponent, MjOptionsComponent, ModalComponent ],
  bootstrap:    [ MjGameComponent ]
})
export class AppModule { }

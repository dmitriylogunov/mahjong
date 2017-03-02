import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MjGameComponent }  from './mj.game.component';
import { MjStatusComponent }  from './mj.status.component';
import { MjTileCollectionComponent }  from './mj.tile-collection.component';
import { MjOptionsComponent }  from './mj.options.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MjGameComponent, MjStatusComponent, MjTileCollectionComponent, MjOptionsComponent ],
  bootstrap:    [ MjGameComponent ]
})
export class MjGameModule { }

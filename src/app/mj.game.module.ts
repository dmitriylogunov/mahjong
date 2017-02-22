import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MjGameComponent }  from './mj.game.component';
import { MjScoreComponent }  from './mj.score.component';
import { MjTileCollectionComponent }  from './mj.tile-collection.component';
import { MjOptionsComponent }  from './mj.options.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MjGameComponent, MjScoreComponent, MjTileCollectionComponent, MjOptionsComponent ],
  bootstrap:    [ MjGameComponent ]
})
export class MjGameModule { }

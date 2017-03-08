import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MjGameComponent }  from './mj.game.component';
import { MjStatusComponent }  from './mj.status.component';
import { MjOptionsComponent }  from './mj.options.component';
import { ModalComponent } from './app.modal.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MjGameComponent, MjStatusComponent, MjOptionsComponent, ModalComponent ],
  bootstrap:    [ MjGameComponent ]
})
export class AppModule { }

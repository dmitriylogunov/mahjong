import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Shared components that will be used across feature modules
import { ModalComponent } from '../../app.modal.component';

// Shared pipes
import { IntAsTimePipe } from '../../pipes/int.as.time.pipe';
import { IntvalPipe } from '../../pipes/intval.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    ModalComponent,
    IntAsTimePipe,
    IntvalPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    IntAsTimePipe,
    IntvalPipe
  ]
})
export class SharedModule { }
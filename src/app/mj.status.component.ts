import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalComponent } from './app.modal.component';

@Component({
  selector: 'status',
  template: `
    <div class="status">
      <span class="hints">
        Hints:
        <span *ngFor="let isActive of hints" (click)="onHintClick()" class="hint"
        [class.active]="isActive">Hint</span>
      </span>
      <span class="undo">
        <span>Undo</span>
        <span>Redo</span>
      </span>
      <span class="timer">0:15</span>
      <span class="restart">X</span>
    </div>

    <button type="button" (click)="modal.show()">Dialog</button>
    <app-modal [actions]=restartGameModalActions>
        Restart game?
    </app-modal>
  `,
  styleUrls: ['app/mj.status.component.css'],
})
/*

<div class="app-modal-actions">
  <button type="button" class="btn btn-default" (click)="modal.hide()">No</button>
  <button type="button" class="btn btn-primary">Yes</button>
</div>

*/
export class MjStatusComponent  {
  @ViewChild(ModalComponent)
  public readonly modal: ModalComponent;

  public restartGameModalActions: string[] = ['Yes', 'No'];

  hintsCount: number = 3;
  hintsAvailable: number;
  hints: boolean[];
  startTime: number;

  @Input()
  width: number;

  @Input()
  scale: number;

  @Output() hint: EventEmitter<any> = new EventEmitter();
  @Output() undo: EventEmitter<any> = new EventEmitter();
  @Output() redo: EventEmitter<any> = new EventEmitter();
  @Output() restart: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.hints = Array(this.hintsCount).fill(true);
    this.hintsAvailable = 3;
    this.startTime = Date.now();
  }

  onHintClick(): void {
    if (this.hintsAvailable > 0) {
      this.hintsAvailable--;
      this.hint.emit(null);
      this.hints[this.hintsAvailable] = false;
    }
  }

  onUndoClick() {
    this.undo.emit(null);
  }

  onRedoClick() {
    this.redo.emit(null);
  }

  onRestartClick() {
    this.restart.emit(null);
  }
}

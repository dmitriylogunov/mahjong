import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalComponent, ModalAction } from './app.modal.component';

@Component({
  selector: 'status',
  template: `
    <div class="status">
      <span class="hints">
        Hints:
        <span *ngFor="let isActive of hints" (click)=onHintClick() class="hint"
        [class.active]="isActive">&nbsp;</span>
      </span>
      <span class="restart" (click)=restartModal.show()>Restart</span>
      <span class="timer">0:15</span>
      <span class="undoredo">
        <span class="undo">Undo</span>
        <span class="redo">Redo</span>
      </span>
    </div>

    <app-modal [actions]=restartGameModalActions>
        Restart game?
    </app-modal>
  `,
  styleUrls: ['app/mj.status.component.css'],
})

export class MjStatusComponent  {
  @ViewChild(ModalComponent)
  public readonly restartModal: ModalComponent;

  public restartGameModalActions: ModalAction[] = [
    new ModalAction("Yes", this.onRestartClick),
    new ModalAction("No", this.onRestartNoClick)
  ];

  @Input()
  set hintsCount(hintsCount: number) {
    this.hints = Array(hintsCount).fill(true);
    this.hintsAvailable = hintsCount;
  }
  get hintsCount(): number { return this.hintsAvailable; }

  hintsAvailable: number;
  hints: boolean[];
  startTime: number;

  // @Input()
  // width: number;
  //
  // @Input()
  // scale: number;

  @Output() hint: EventEmitter<any> = new EventEmitter();
  @Output() undo: EventEmitter<any> = new EventEmitter();
  @Output() redo: EventEmitter<any> = new EventEmitter();
  @Output() restart: EventEmitter<any> = new EventEmitter();

  constructor() {
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

  onRestartNoClick() {
    this.restartModal.hide();
  }

  public reset() {
    this.hintsAvailable = this.hints.length;
  }
}

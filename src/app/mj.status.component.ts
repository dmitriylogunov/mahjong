import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalComponent, ModalAction } from './app.modal.component';
import { MjGameControlService } from './mj.game.control.service';

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
        <span class="undo" (click)=onUndoClick() [class.disabled]=undoStatus>Undo</span>
        <span class="redo" (click)=onRedoClick() [class.disabled]=redoStatus>Redo</span>
      </span>
    </div>

    <app-modal [actions]=restartGameModalActions>
        Restart game?
    </app-modal>
  `,
  styleUrls: ['app/mj.status.component.css'],
  providers: [MjGameControlService]
})

export class MjStatusComponent  {
  @ViewChild(ModalComponent)
  public readonly restartModal: ModalComponent;

  public restartGameModalActions: ModalAction[] = [
    new ModalAction("Yes", this.onRestartClick),
    new ModalAction("No", this.onRestartNoClick)
  ];

  undoStatus: boolean = true;
  redoStatus: boolean = true;
  showHintStatus: boolean = true;

  constructor(private mjGameControlService: MjGameControlService) {
    this.startTime = Date.now();

    mjGameControlService.undoStatusUpdated$.subscribe(
      status => {
        this.undoStatus = status;
      }
    );

    mjGameControlService.redoStatusUpdated$.subscribe(
      status => {
        this.redoStatus = status;
      }
    );

  }


  @Input()
  set hintsCount(hintsCount: number) {
    this.hints = Array(hintsCount).fill(true);
    this.hintsAvailable = hintsCount;
  }
  get hintsCount(): number { return this.hintsAvailable; }

  hintsAvailable: number;
  hints: boolean[];
  startTime: number;

  @Output() undo: EventEmitter<any> = new EventEmitter();
  @Output() redo: EventEmitter<any> = new EventEmitter();
  @Output() restart: EventEmitter<any> = new EventEmitter();

  onHintClick(): void {
    if (this.hintsAvailable > 0) {
      this.hintsAvailable--;
      this.hints[this.hintsAvailable] = false;

      // inform other components that hint is requested
      this.mjGameControlService.updateHintStatus(true);
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

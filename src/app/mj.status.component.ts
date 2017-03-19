import { Component, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { ModalComponent, ModalAction } from './app.modal.component';
import { MjGameControlService } from './mj.game.control.service';
import { Subscription } from 'rxjs/Subscription'

@Component({
  selector: 'status',
  template: `
    <div class="status">
      <span class="hints">
        Hints:
        <span *ngFor="let isAvailable of hints" (click)=onHintClick() class="hint"
        [class.available]="isAvailable"
        [class.active]="hintCurrentlyShowing"
        >&nbsp;</span>
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
  styleUrls: ['app/mj.status.component.css']
})

export class MjStatusComponent implements OnDestroy  {
  @ViewChild(ModalComponent)
  public readonly restartModal: ModalComponent;

  public restartGameModalActions: ModalAction[] = [
    new ModalAction("Yes", this.onRestartClick),
    new ModalAction("No", this.onRestartNoClick)
  ];

  undoStatus: boolean = true;
  redoStatus: boolean = true;
  hintCurrentlyShowing: boolean = false;

  private undoSubscription: Subscription;
  private redoSubscription: Subscription;
  private hintRequestSubscription: Subscription;

  constructor(private mjGameControlService: MjGameControlService) {
    this.startTime = Date.now();

    // subscribe to events
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

    this.hintRequestSubscription = mjGameControlService.hintRequestUpdated$.subscribe(
      status => {
        if (status) {
          this.hintCurrentlyShowing = true;
        } else {
          window.setTimeout((()=>{
            this.hintCurrentlyShowing = false;
          }).bind(this), 250);
        }
      }
    );
  }

  ngOnDestroy(): void {
    // prevent memory leak
    this.undoSubscription.unsubscribe();
    this.redoSubscription.unsubscribe();
    this.hintRequestSubscription.unsubscribe();
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

  private hintStatus: boolean = false;
  onHintClick(): void {
    if (!this.hintCurrentlyShowing) {
      if (this.hintsAvailable > 0) {
        this.hintsAvailable--;
        this.hints[this.hintsAvailable] = false;

        // inform other components that hint is requested
        this.hintCurrentlyShowing = true; //seems like duplication but it is not. it overcomes possible concurrency issues.
        this.mjGameControlService.updateHintStatus(true);
      }
    } else {
      this.hintCurrentlyShowing = false;
      this.mjGameControlService.updateHintStatus(false);
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

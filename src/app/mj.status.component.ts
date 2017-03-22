import { Component, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { ModalComponent, ModalAction } from './app.modal.component';
import { MjGameControlService } from './mj.game.control.service';
import { Subscription } from 'rxjs/Subscription'
import { MjAudioService } from './mj.audio.service';

@Component({
  selector: 'status',
  template: `
    <div class="status noselect">
      <span class="hints">
        Hints:
        <span *ngFor="let isAvailable of hints" (click)=onHintClick() class="hint"
        [class.available]="isAvailable"
        [class.active]="hintCurrentlyShowing"
        ><i class="fa fa-diamond" aria-hidden="true"></i></span>
      </span>
      <span class="score">{{score}}</span>
      <span class="timer">{{timer | date:"m:ss"}}</span>

      <span class="sound" (click)=onSoundClick()>
        <i *ngIf="soundStatus" class="fa fa-volume-up" aria-hidden="true"></i>
        <i *ngIf="!soundStatus" class="fa fa-volume-off" aria-hidden="true"></i>
      </span>
      <span class="restart" (click)=restartModal.show()>Restart</span>

      <span class="undoredo">
        <span class="undo" (click)=onUndoClick() [class.disabled]=undoStatus><i class="fa fa-undo" aria-hidden="true"></i></span>
        <span class="redo" (click)=onRedoClick() [class.disabled]=redoStatus><i class="fa fa-repeat" aria-hidden="true"></i></span>
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

  private subscriptions: Subscription[] = [];

  constructor(private gameControlService: MjGameControlService, private audioService: MjAudioService) {
    // subscribe to events
    this.subscriptions.push(gameControlService.undoStatusUpdated$.subscribe(
      status => {
        this.undoStatus = status;
      }
    ));

    this.subscriptions.push(gameControlService.redoStatusUpdated$.subscribe(
      status => {
        this.redoStatus = status;
      }
    ));

    this.subscriptions.push(gameControlService.hintRequestUpdated$.subscribe(
      status => {
        if (status) {
          this.hintCurrentlyShowing = true;
        } else {
          window.setTimeout((()=>{
            this.hintCurrentlyShowing = false;
          }).bind(this), 250);
        }
      }
    ));

    this.subscriptions.push(gameControlService.soundUpdated$.subscribe(
      status => {
        this.soundStatus = status;
      }
    ));

    this.reset();
  }

  ngOnDestroy(): void {
    // prevent memory leak
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  @Input()
  paused: boolean;

  private soundStatus: boolean;

  hintsRemaining: number;
  hints: boolean[] = [];
  @Input()
  set hintsCount(hintsCount: number) {
    this.hints = Array(hintsCount).fill(true);
    this.hintsRemaining = hintsCount;
  }

  @Input()
  private score: number;
  private timer: Date = new Date();

  @Output() undo: EventEmitter<any> = new EventEmitter();
  @Output() redo: EventEmitter<any> = new EventEmitter();
  @Output() restart: EventEmitter<any> = new EventEmitter();

  private hintStatus: boolean = false;
  onHintClick(): void {
    if (!this.hintCurrentlyShowing) {
      if (this.hintsRemaining > 0) {
        this.hintsRemaining--;
        this.hints[this.hintsRemaining] = false;

        // inform other components that hint is requested
        this.hintCurrentlyShowing = true; //seems like duplication but it is not. it overcomes possible concurrency issues.
        this.gameControlService.updateHintStatus(true);
      }
    } else {
      this.hintCurrentlyShowing = false;
      this.gameControlService.updateHintStatus(false);
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

  onSoundClick() {
    this.soundStatus = !this.soundStatus;
    this.gameControlService.updateSoundStatus(this.soundStatus);
  }

  public reset() {
    this.hintsRemaining = this.hints.length;
    this.timer = new Date();
  }
}

import { Component, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { ModalComponent, ModalAction } from './app.modal.component';
import { MjGameControlService } from './mj.game.control.service';
import { Subscription } from 'rxjs/Subscription'
import { MjAudioService } from './mj.audio.service';

@Component({
  selector: 'status',
  template: `
    <div class="status noselect">

      <!-- left side block -->
      <span class="hints large-screen-only">
        Hints:
        <span *ngFor="let isAvailable of hints; let i=index;" (click)=onHintClick() class="hint"
        [ngClass]="{'active blinking': (i==hintsRemaining) && hintCurrentlyShowing, 'available': isAvailable}"
        ><i class="fa fa-diamond" aria-hidden="true"></i></span>
      </span>
      <span class="hints small-screen-only">
        <span (click)=onHintClick() class="hint" [class.active]="hintCurrentlyShowing" [class.available]="hintsRemaining>0">
          <i class="fa fa-diamond" aria-hidden="true"></i> x{{hintsRemaining}}
        </span>
      </span>

      <!-- middle block -->
      <span class="score"><i class="fa fa-tachometer" aria-hidden="true"></i>
        <span class="highlight">{{score}}</span>
      </span>

      <span class="timer" *ngIf="bonustimer>0">
        <i class="fa fa-trophy" aria-hidden="true"></i> <span class="highlight">{{bonustimer | date:"m:ss"}}</span>
      </span>
      <span class="timer">
        <i class="fa fa-clock-o" aria-hidden="true"></i> <span class="highlight">{{timer | date:"m:ss"}}</span>
      </span>

      <!-- right side block -->
      <span class="restart highlight" (click)=restartModal.show()><i class="fa fa-close" aria-hidden="true"></i></span>
      <span class="pause highlight" (click)=onPauseClick()>
        <i *ngIf="paused" class="fa fa-play-circle-o" aria-hidden="true"></i>
        <i *ngIf="!paused" class="fa fa-pause-circle-o" aria-hidden="true"></i>
      </span>

      <span class="sound highlight"><i class="fa fa-music" aria-hidden="true"></i></span>

      <span class="sound highlight" (click)=onSoundClick()>
        <i *ngIf="soundStatus" class="fa fa-volume-up" aria-hidden="true"></i>
        <i *ngIf="!soundStatus" class="fa fa-volume-off" aria-hidden="true"></i>
      </span>

      <span class="undoredo">
        <span class="undo" (click)=onUndoClick() [class.disabled]=!undoStatus><i class="fa fa-undo" aria-hidden="true"></i></span>
        <span class="redo" (click)=onRedoClick() [class.disabled]=!redoStatus><i class="fa fa-repeat" aria-hidden="true"></i></span>
      </span>
    </div>

    <div class="status noselect small-screen-only">
    </div>

    <app-modal [actions]=restartGameModalActions>
        Restart game?
    </app-modal>
  `,
  styleUrls: ['app/mj.status.component.css']
})

export class MjStatusComponent implements OnDestroy {
  @ViewChild(ModalComponent)
  public readonly restartModal: ModalComponent;

  public restartGameModalActions: ModalAction[] = [
    new ModalAction("Yes", this.onRestartClick),
    new ModalAction("No", this.onRestartNoClick)
  ];

  undoStatus: boolean = false;
  redoStatus: boolean = false;
  hintCurrentlyShowing: boolean = false;
  paused: boolean = false;

  public reset() {
    this.hintsRemaining = this.hints.length;
    this.gameControlService.updateHintStatus(false);
    this.startTime = new Date();
    this.bonustimer = new Date();
    this.timer = new Date();
    this.paused = false;
    this.undoStatus = false;
    this.redoStatus = false;
  }

  private subscriptions: Subscription[] = [];

  constructor(private gameControlService: MjGameControlService, private audioService: MjAudioService) {
    // subscribe to events
    this.subscriptions.push(gameControlService.undoStatusUpdated$.subscribe(
      status => {
        this.undoStatus = status;
        console.log("undostatus",status);
      }
    ));

    this.subscriptions.push(gameControlService.redoStatusUpdated$.subscribe(
      status => {
        this.redoStatus = status;
        console.log("redostatus",status);
      }
    ));

    this.subscriptions.push(gameControlService.hintRequestUpdated$.subscribe(
      status => {
        if (status) {
          this.audioService.play("boom", 100);
          this.hintCurrentlyShowing = true;
        } else {
          this.audioService.play("blip", 100);
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

  ngOnInit(): void {
    window.setInterval((()=>{
      // this.timer = this.startTime - new Date();
    }).bind(this), 1000);
  }

  private soundStatus: boolean;

  hintsRemaining: number;
  hints: boolean[] = [];
  @Input()
  set hintsCount(hintsCount: number) {
    this.hints = Array(hintsCount).fill(true);
    this.hintsRemaining = hintsCount -1; // -1 for debug
  }

  @Input()
  private score: number;

  private startTime: Date = null;
  private timer: Date = null;
  private bonustimer: Date = null;

  @Output() undo: EventEmitter<any> = new EventEmitter();
  @Output() redo: EventEmitter<any> = new EventEmitter();
  @Output() restart: EventEmitter<any> = new EventEmitter();

  private hintStatus: boolean = false;
  onHintClick(): void {
    if (!this.hintCurrentlyShowing) {
      if (this.hintsRemaining > 0) {
        // this.hintsRemaining--;
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
    if (this.undoStatus) {
      this.undo.emit(null);
    } else {
      this.audioService.play("wrong", 100);
    }
  }

  onRedoClick() {
    if (this.redoStatus) {
      this.redo.emit(null);
    } else {
      this.audioService.play("wrong", 100);
    }
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

  onPauseClick() {
    this.paused = !this.paused;
    this.gameControlService.pause(this.paused);
  }
}

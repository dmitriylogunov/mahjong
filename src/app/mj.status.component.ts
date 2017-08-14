import { Component, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { MjGameControlService } from './services/mj.game.control.service';
import { Subscription } from 'rxjs/Subscription'
import { MjAudioService } from './services/mj.audio.service';

@Component({
  selector: 'status',
  templateUrl: 'templates/mj.status.component.html',
  styleUrls: ['styles/mj.status.component.css']
})
export class MjStatusComponent implements OnDestroy {
  @Input()
  private score: number;

  @Input()
  private timer: number;

  @Input()
  private showDebugFields: boolean;

  private subscriptions: Subscription[] = [];

  constructor(private gameControlService: MjGameControlService, private audioService: MjAudioService) {
    // subscribe to events
    this.subscriptions.push(gameControlService.undoStatusUpdated$.subscribe(
      status => {
        this.undoStatus = status;
        // console.log("undostatus",status);
      }
    ));

    this.subscriptions.push(gameControlService.redoStatusUpdated$.subscribe(
      status => {
        this.redoStatus = status;
        // console.log("redostatus",status);
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
  }

  private isVisible: boolean = false;
  private paused: boolean;
  private undoStatus: boolean = false;
  private redoStatus: boolean = false;
  private hintCurrentlyShowing: boolean = false;

  public show(): void {
    this.isVisible = true;
  }

  public hide(): void {
    this.isVisible = false;
  }

  public reset() {
    this.hintsRemaining = this.hints.length;
    this.gameControlService.updateHintStatus(false);
    this.undoStatus = false;
    this.redoStatus = false;
    this.paused = false;
  }

  private soundStatus: boolean;

  hintsRemaining: number;
  hints: boolean[] = [];
  @Input()
  set hintsCount(hintsCount: number) {
    this.hints = Array(hintsCount).fill(true);
    this.hintsRemaining = hintsCount -1; // -1 for debug
  }

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

  onSoundClick() {
    this.soundStatus = !this.soundStatus;
    this.gameControlService.updateSoundStatus(this.soundStatus);
  }

  onPauseClick() {
    this.paused = !this.paused;
    this.gameControlService.pause(this.paused);
  }

  onStepClick() {
    this.gameControlService.debug("step");
  }

  onSolveClick() {
    this.gameControlService.debug("solve");
  }
}

import { Component, ViewChild, ViewChildren, OnDestroy, QueryList } from '@angular/core';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';
import { MjGameControlService } from './mj.game.control.service';
import { MjAudioService, SoundConfiguration } from './mj.audio.service';
import { ModalComponent, ModalAction } from './app.modal.component';
import { Subscription } from 'rxjs/Subscription';
import { TweenLite } from 'gsap';

@Component({
  selector: 'mj-game',
  template: `
  <!-- main menu -->
  <modal [actions]=[]></modal>

  <!-- restart dialog -->
  <modal [actions]=restartGameModalActions>
      Restart game?
  </modal>

  <div class="statusfield"><status
    (undo)=onUndo()
    (redo)=onRedo()
    (restart)=onRestart()
    [hintsCount]=3
    [score]=score
    [timer]=timer
  ></status></div>

  <div class="gamefield noselect"><tile-collection
    [layout]=currentLayout
    (ready)=onTileCollectionReady()
    (tileCleared)=onTileCleared()
    (click)=onClick()
    [paused]=paused
    ></tile-collection></div>

    <div *ngIf="state=='intro'" class="intro">
      Logo here
    </div>
  `,
  styles: [`
      .statusfield
      {
        position: relative;
        width: 100vw;
        height: 5vh;
        background-color:#5C5749;
      }
      .gamefield {
        position: relative;
        width: 100vw;
        height: 95vh;
        /*background-color: #BEDDBF;*/
        background-size: cover;
        background-image: url('/img/backgrounds/oriental-1.jpg')
      }

      .intro {
        width: 100vw;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background:rgba(0,0,0,0.8);
        display: none;
      }
  `],
  providers: [MjGameControlService, MjAudioService]
})
export class MjGameComponent {
  private state: string;
  private score: number;
  private timer: number;
  private paused: boolean;

  private soundConfiguration: SoundConfiguration = {
    "coin": ["sounds/coin1.wav", "sounds/coin2.wav", "sounds/coin3.wav"],
    "blip": ["sounds/blip.wav"],
    "undo": ["sounds/back.wav"],
    "bonus": ["sounds/bonus.wav"],
    "boom": ["sounds/boom.wav"],
    "wrong": ["sounds/wrong.wav"],
    "lose": ["sounds/lose.wav"],
    "win": ["sounds/win.wav"],
    "click": ["sounds/click1.wav"], //, "sounds/click2.wav"
    "unclick": ["sounds/click-reverse.wav"],
    "question": ["sounds/question.wav"]
  };

  private subscriptions: Subscription[] = [];
  constructor(private gameControlService: MjGameControlService, private audioService: MjAudioService) {
    this.subscriptions.push(audioService.soundsReady$.subscribe(
      status => {
        this.playMusic();
      }
    ));

    this.subscriptions.push(gameControlService.paused$.subscribe(
      status => {
        this.paused = status;
      }
    ));

    window.setInterval((()=>{
      if (!this.paused) {
        this.timer += 1;
        this.score -= 0.1;
      }
    }).bind(this), 1000);
  }

  ngOnDestroy(): void {
    // prevent memory leak
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  @ViewChild(MJTileCollectionComponent)
  private tileCollection: MJTileCollectionComponent;

  @ViewChild(MjStatusComponent)
  private status: MjStatusComponent;

  public currentLayout: string = null;

  ngOnInit(): void {
    this.paused = true;
    this.state = "intro";

    this.audioService.load(this.soundConfiguration);

    // TODO - read from browser config
    this.gameControlService.updateSoundStatus(true);

    // load layout
    // TODO show "loading"
    // console.log("loading started");
    this.currentLayout = "dragon"; // update of layout will trigger initialisation of layout controller and tile field

    // start game now
    this.initGameValues();
  }

  public restartGameModalActions: ModalAction[] = [
    new ModalAction("Yes", this.onRestartYesClick),
    new ModalAction("No", this.onRestartNoClick)
  ];

  @ViewChildren(ModalComponent)
  public readonly modals: QueryList<ModalComponent>;

  private menuModal: ModalComponent;
  private restartModal: ModalComponent;

  ngAfterViewInit(): void {
    // this.menuModal = this.modals[0];
    // this.restartModal = this.modals[1];
    console.log(this.modals);
    console.log(this.menuModal);
    console.log(this.restartModal);
  }

  onTileCollectionReady():void {
    // TODO hide "loading"
    // console.log("loading finished");
  }

  private checkGameStatus():void {
    if (this.tileCollection.activeTileCount==0) {
      // win
      this.audioService.play("win", 100);
    } else if (this.tileCollection.freePairs.length==0) {
      // lose
      this.audioService.play("lose", 100);
    } else {
      // keep on playing
      this.audioService.play("coin", 100);
    }
  }

  onTileCleared(): void {
    this.gameControlService.updateUndoStatus(true);
    this.gameControlService.updateRedoStatus(false);
    this.score += 10;
    this.checkGameStatus();
  }

  public onUndo() {
    let undoStatus = this.tileCollection.undo();
    this.gameControlService.updateUndoStatus(undoStatus);
    this.gameControlService.updateRedoStatus(true);
    this.audioService.play("undo", 100);
    if (this.score>0) { this.score -= 10 };
  }

  public onRedo() {
    let redoStatus = this.tileCollection.redo();
    this.gameControlService.updateUndoStatus(true);
    this.gameControlService.updateRedoStatus(redoStatus);
    this.checkGameStatus();
    this.score += 10;
  }

  // a.k.a. this.restart()
  public onRestart() {
    this.restartModal.show();
  }

  onRestartYesClick() {
    this.initGameValues();
    this.tileCollection.reset();
    this.status.reset();
  }

  onRestartNoClick() {
    this.restartModal.hide();
  }

  private initGameValues() {
    this.score = 0;
    this.timer = 0;
    this.paused = false;
    this.gameControlService.pause(false);
  }

  private onClick() {
    // stop hint animation
    this.gameControlService.updateHintStatus(false);
  }

  private playMusic(): void {
    // this.audioService.playFile("music/");
  }

  private stopMusic(): void {

  }
}

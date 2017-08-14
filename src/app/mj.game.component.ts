import { Component, ViewChild, ViewChildren, OnDestroy, QueryList } from '@angular/core';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';
import { MjGameControlService } from './services/mj.game.control.service';
import { MjAudioService, SoundConfiguration } from './services/mj.audio.service';
import { ModalComponent, ModalAction } from './app.modal.component';
import { Subscription } from 'rxjs/Subscription';
import { TweenLite } from 'gsap';

@Component({
  selector: 'mj-game',
  template: `
  <!-- main menu -->
  <modal [actions]=mainMenuModalActions>
    <h1 class="gametitle">Mahjong<br/>Solitaire</h1>
  </modal>

  <!-- restart dialog -->
  <modal [actions]=restartGameModalActions>
      <h1>Restart game?</h1>
  </modal>

  <!-- no more free tiles -->
  <modal [actions]=tieModalActions>
    There are no more free tiles left. From here you can:
    <ul>
      <li>Continue playing, undo the latest moves and try a different strategy</li>
      <li>Replay the game with same layout</li>
      <li>Restart the game with different layout</li>
    </ul>
  </modal>

  <!-- win -->
  <modal [actions]=winModalActions>
    <h1>Congratulations, you win.</h1>
    <p>Your score is {{score}}.</p>
  </modal>

  <div class="statusfield"><status
    (undo)=onUndo()
    (redo)=onRedo()
    (restart)=onRestartRequest()
    [hintsCount]=numberOfHints
    [score]=score
    [timer]=timer
    [showDebugFields]=showDebugFields
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
      h1 {
        width: 100%;
        text-align: center;
        font-size: 55px;
        text-transform: uppercase;
      }
      .gametitle {
        color: lightgreen;
        font-family: "Palatino", "Garamond", "Courier new";
      }
  `],
  providers: [MjGameControlService, MjAudioService]
})
export class MjGameComponent {
  //config
  public numberOfHints = 3;
  public showDebugFields = true;

  //
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
    // Global game event subscriptions
    this.subscriptions.push(audioService.soundsReady$.subscribe(
      dummyVariable => {
        this.playMusic();
      }
    ));

    this.subscriptions.push(gameControlService.paused$.subscribe(
      pauseStatus => {
        this.paused = pauseStatus;
      }
    ));

    this.subscriptions.push(gameControlService.debugCommand$.subscribe(
      command => {
        this.onDebugCommand(command);
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
    this.state = "intro";

    this.audioService.load(this.soundConfiguration);

    // TODO - read from browser config
    this.gameControlService.updateSoundStatus(true);

    // load layout
    // TODO show "loading"
    // console.log("loading started");
    this.currentLayout = "dragon"; // update of layout will trigger initialisation of layout controller and tile field

    // initialisation sequence continued in ngAfterViewInit
  }

  public mainMenuModalActions: ModalAction[] = [
    new ModalAction("Start", (()=>{this.onStartGameClick();}).bind(this))
  ];

  public restartGameModalActions: ModalAction[] = [
    new ModalAction("Yes", (()=>{this.onRestartYesClick();}).bind(this))
    // new ModalAction("No", (()=>{}))
  ];

  public tieModalActions: ModalAction[] = [
    // new ModalAction("Continue", (()=>{})), // do nothing
    new ModalAction("Restart", (()=>{this.onTieRestartClick();}).bind(this)),
    new ModalAction("New game", (()=>{this.onRestartYesClick();}).bind(this))
  ];

  public winModalActions: ModalAction[] = [
    new ModalAction("Play Again", (()=>{this.onRestartYesClick();}).bind(this))
  ];

  @ViewChildren(ModalComponent)
  public readonly modals: QueryList<ModalComponent>;

  private mainMenuModal: ModalComponent;
  private restartModal: ModalComponent;
  private tieModal: ModalComponent;
  private winModal: ModalComponent;

  ngAfterViewInit(): void {
    let arModals: ModalComponent[] = this.modals.toArray();
    this.mainMenuModal = arModals[0];
    this.restartModal = arModals[1];
    this.tieModal = arModals[2];
    this.winModal = arModals[3];

    // show main menu
    this.mainMenuModal.show();
  }

  onTileCollectionReady():void {
    // TODO hide "loading"
    // console.log("loading finished");
  }

  private checkGameStatus():void {
    if (!this.tileCollection.hasFreePairs()) {
      if (this.tileCollection.visibleTileCount==0) {
        // win
        this.audioService.play("win", 100);
        this.state = "win";
        this.status.hide();
        this.tileCollection.hide();
        this.winModal.show();
      } else {
        // lose
        this.audioService.play("lose", 100);
        this.tieModal.show();
      }
    }
  }

  onTileCleared(): void {
    this.gameControlService.updateUndoStatus(true);
    this.gameControlService.updateRedoStatus(false);
    this.score += 10;
    this.audioService.play("coin", 100);
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

  public onClearPair() {
    this.tileCollection.clearTilePair();
  }

  public onRestartRequest() {
    this.restartModal.show();
  }

  private startGame(): void {
    this.state = "game";
    this.initGameValues();
    this.status.reset();
    this.status.show();
    this.tileCollection.show();
  }

  onStartGameClick() {
    this.startGame();
  }

  onRestartYesClick() {
    this.tileCollection.reset();
    this.startGame();
  }

  onTieRestartClick() {
    this.tileCollection.reset(false);
    this.startGame();
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

  private onDebugCommand(command: string) {
    if (command=='step') {
      this.tileCollection.clearTilePair();
    }

    if (command=='solve') {
      while (this.tileCollection.hasFreePairs()) {
        this.tileCollection.clearTilePair();
      }
    }
  }
}

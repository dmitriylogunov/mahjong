import {
  Component,
  ViewChild,
  ViewChildren,
  OnDestroy,
  QueryList,
} from "@angular/core";
import { MjStatusComponent } from "./mj.status.component";
import { MjTileFieldComponent } from "./mj.tile.field.component";
import { MjGameControlService } from "./services/mj.game.control.service";
import {
  MjAudioService,
  SoundConfiguration,
} from "./services/mj.audio.service";
import { ModalComponent, ModalAction } from "./app.modal.component";
import { Subscription } from "rxjs/Subscription";
import { TweenLite } from "gsap";

@Component({
  selector: "mj-game",
  templateUrl: "templates/mj.game.component.html",
  styleUrls: ["styles/mj.game.component.css"],
  providers: [MjGameControlService, MjAudioService],
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
    coin: ["sounds/coin1.wav", "sounds/coin2.wav", "sounds/coin3.wav"],
    blip: ["sounds/blip.wav"],
    undo: ["sounds/back.wav"],
    bonus: ["sounds/bonus.wav"],
    boom: ["sounds/boom.wav"],
    wrong: ["sounds/wrong.wav"],
    lose: ["sounds/lose.wav"],
    win: ["sounds/win.wav"],
    click: ["sounds/click1.wav"], //, "sounds/click2.wav"
    unclick: ["sounds/click-reverse.wav"],
    question: ["sounds/question.wav"],
  };

  private subscriptions: Subscription[] = [];
  constructor(
    private gameControlService: MjGameControlService,
    private audioService: MjAudioService
  ) {
    // Global game event subscriptions
    this.subscriptions.push(
      audioService.soundsReady$.subscribe((dummyVariable) => {
        this.playMusic();
      })
    );

    this.subscriptions.push(
      gameControlService.paused$.subscribe((pauseStatus) => {
        this.paused = pauseStatus;
      })
    );

    this.subscriptions.push(
      gameControlService.debugCommand$.subscribe((command) => {
        this.onDebugCommand(command);
      })
    );

    window.setInterval(
      (() => {
        if (!this.paused) {
          this.timer += 1;
          this.score -= 0.1;
        }
      }).bind(this),
      1000
    );
  }

  ngOnDestroy(): void {
    // prevent memory leak
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  @ViewChild(MjTileFieldComponent)
  private tileField: MjTileFieldComponent;

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
    new ModalAction(
      "Start",
      (() => {
        this.onStartGameClick();
      }).bind(this)
    ),
  ];

  public restartGameModalActions: ModalAction[] = [
    new ModalAction(
      "Yes",
      (() => {
        this.onRestartYesClick();
      }).bind(this)
    ),
    // new ModalAction("No", (()=>{}))
  ];

  public tieModalActions: ModalAction[] = [
    // new ModalAction("Continue", (()=>{})), // do nothing
    new ModalAction(
      "Restart",
      (() => {
        this.onTieRestartClick();
      }).bind(this)
    ),
    new ModalAction(
      "New game",
      (() => {
        this.onRestartYesClick();
      }).bind(this)
    ),
  ];

  public winModalActions: ModalAction[] = [
    new ModalAction(
      "Play Again",
      (() => {
        this.onRestartYesClick();
      }).bind(this)
    ),
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

  onTileCollectionReady(): void {
    // TODO hide "loading"
    // console.log("loading finished");
  }

  private checkGameStatus(): void {
    if (!this.tileField.hasFreePairs()) {
      if (this.tileField.visibleTileCount == 0) {
        // win
        this.audioService.play("win", 100);
        this.state = "win";
        this.status.hide();
        this.tileField.hide();
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
    let undoStatus = this.tileField.undo();
    this.gameControlService.updateUndoStatus(undoStatus);
    this.gameControlService.updateRedoStatus(true);
    this.audioService.play("undo", 100);
    if (this.score > 0) {
      this.score -= 10;
    }
  }

  public onRedo() {
    let redoStatus = this.tileField.redo();
    this.gameControlService.updateUndoStatus(true);
    this.gameControlService.updateRedoStatus(redoStatus);
    this.checkGameStatus();
    this.score += 10;
  }

  public onClearPair() {
    this.tileField.clearTilePair();
  }

  public onRestartRequest() {
    this.restartModal.show();
  }

  private startGame(): void {
    this.state = "game";
    this.initGameValues();
    this.status.reset();
    this.status.show();
    this.tileField.show();
  }

  onStartGameClick() {
    this.startGame();
  }

  onRestartYesClick() {
    this.tileField.reset();
    this.startGame();
  }

  onTieRestartClick() {
    this.tileField.reset(false);
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

  private stopMusic(): void {}

  private onDebugCommand(command: string) {
    if (command == "step") {
      this.tileField.clearTilePair();
    }

    if (command == "solve") {
      while (this.tileField.hasFreePairs()) {
        this.tileField.clearTilePair();
      }
    }
  }
}

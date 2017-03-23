import { Component, ViewChild, OnDestroy } from '@angular/core';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';
import { MjGameControlService } from './mj.game.control.service';
import { MjAudioService } from './mj.audio.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'mj-game',
  template: `
    <style>
      .statusfield
      {
        position: relative;
        width: 100vw;
      }
      .gamefield {
        position: relative;
        width: 100vw;
        height: 80vh;
        background-color: #BEDDBF;
      }
    </style>

    <div class="statusfield"><status
      (undo)=onUndoRequest()
      (redo)=onRedoRequest()
      (restart)=onRestartRequest()
      [hintsCount]=3
      [score]=score
    ></status></div>

    <div class="gamefield noselect"><tile-collection
      [layout]=currentLayout
      (ready)=onTileCollectionReady()
      (tileCleared)=onTileCleared()
      (click)=onClick()
      [paused]=false
      ></tile-collection></div>

    <options></options>
  `,
  providers: [MjGameControlService, MjAudioService]
})
export class MjGameComponent {
  private subscriptions: Subscription[] = [];
  constructor(private gameControlService: MjGameControlService, private audioService: MjAudioService) {
    this.subscriptions.push(audioService.soundsReady$.subscribe(
      status => {
        // TODO start playing music here, if it is on
      }
    ));
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
    this.audioService.load();

    // TODO - read from browser config
    this.gameControlService.updateSoundStatus(true);

    // load layout
    console.log("loading started");     // TODO show "loading"
    this.currentLayout = "dragon";
  }

  onTileCollectionReady():void {
    console.log("loading finished"); // TODO hide "loading"
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

    this.checkGameStatus();
  }

  public onUndoRequest() {
    let undoStatus = this.tileCollection.undo();
    this.gameControlService.updateUndoStatus(undoStatus);
    this.gameControlService.updateRedoStatus(true);
    this.audioService.play("undo", 100);
  }

  public onRedoRequest() {
    let redoStatus = this.tileCollection.redo();
    this.gameControlService.updateUndoStatus(true);
    this.gameControlService.updateRedoStatus(redoStatus);
    this.checkGameStatus();
  }

  public onRestartRequest() {
    this.tileCollection.reset();
    this.status.reset();
  }

  private onClick() {
    // stop hint animation
    this.gameControlService.updateHintStatus(false);
  }

  private score: number = 0;
}

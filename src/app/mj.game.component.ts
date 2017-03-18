import { Component, ViewChild } from '@angular/core';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';
import { MjGameControlService } from './mj.game.control.service';

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
        padding: 10px;
        background-color: lightyellow;
      }
      .noselect {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently
                            supported by Chrome and Opera */
      }
    </style>

    <div class="statusfield"><status
      (undo)=onUndoRequest()
      (redo)=onRedoRequest()
      (restart)=onRestartRequest()
      [hintsCount]=3
    ></status></div>

    <div class="gamefield noselect"><tile-collection
      [layout]=currentLayout
      (ready)=onTileCollectionReady()
      (gameStateChanged)=onGameStateChanged()
      (click)=onClick()
      ></tile-collection></div>

    <options></options>
  `,
  providers: [MjGameControlService]
})
export class MjGameComponent {
  constructor(private gameControlService: MjGameControlService) {
  }

  @ViewChild(MJTileCollectionComponent)
  private tileCollection: MJTileCollectionComponent;

  @ViewChild(MjStatusComponent)
  private status: MjStatusComponent;

  public currentLayout: string = null;

  ngOnInit(): void {
    // load layout
    console.log("loading started");     // TODO show "loading"
    this.currentLayout = "dragon";
  }

  onTileCollectionReady():void {
    console.log("loading finished"); // TODO hide "loading"
  }

  onGameStateChanged(): void {
    let status = this.getGameEndStatus();
    if (status==="win") {
      // trigger win
    } else if (status==="lose") {
      // trigger lose
    }

    this.gameControlService.updateUndoStatus(true);
    this.gameControlService.updateRedoStatus(false);
  }

  private getGameEndStatus(): string {
    if (this.tileCollection.activeTileCount==0) {
      return "win";
    }
    if (this.tileCollection.freePairs.length==0) {
      return "lose";
    }
  }

  private undoStatus = false;
  public onUndoRequest() {
    let undoStatus = this.tileCollection.undo();

    this.gameControlService.updateUndoStatus(undoStatus);
    this.gameControlService.updateRedoStatus(true);
  }

  private redoStatus = false;
  public onRedoRequest() {
    let redoStatus = this.tileCollection.redo();

    this.gameControlService.updateRedoStatus(redoStatus);
    this.gameControlService.updateUndoStatus(true);
  }

  public onRestartRequest() {
    this.tileCollection.reset();
    this.status.reset();
  }

  private onClick() {
    // stop hint animation
    // this.gameControlService.updateHintStatus(false);
  }
}

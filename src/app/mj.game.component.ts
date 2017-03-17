import { Component, ViewChild } from '@angular/core';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';

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
      (hint)=onHintRequest()
      (undo)=onUndoRequest()
      (redo)=onRedoRequest()
      (restart)=onRestartRequest()
      [hintsCount]=3
      [undoStatus]=undoStatus
      [redoStatus]=redoStatus
    ></status></div>

    <div class="gamefield noselect"><tile-collection
      [layout]=currentLayout
      (ready)=onTileCollectionReady()
      (gameStateChanged)=onGameStateChanged()
      ></tile-collection></div>

    <options></options>
  `
})
export class MjGameComponent {
  constructor() {
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

    // this.undoStatus = true;
    // this.redoStatus = false;
  }

  private getGameEndStatus(): string {
    if (this.tileCollection.activeTileCount==0) {
      return "win";
    }
    if (this.tileCollection.freePairs.length==0) {
      return "lose";
    }
  }

  public onHintRequest() {
    this.tileCollection.showHints();
  }

  private undoStatus = false;
  public onUndoRequest() {
    // this.undoStatus = this.tileCollection.undo();
    // this.redoStatus = true;
  }

  private redoStatus = false;
  public onRedoRequest() {
    // this.redoStatus = this.tileCollection.redo();
    // this.undoStatus = true;
  }

  public onRestartRequest() {
    this.tileCollection.reset();
    this.status.reset();
  }
}

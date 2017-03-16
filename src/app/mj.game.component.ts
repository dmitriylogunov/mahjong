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
    </style>
    <div class="statusfield"><status (hint)=onShowHint() (undo)=onUndo() (redo)=onRedo() [hintsCount]=3></status></div>
    <div class="gamefield"><tile-collection (ready)=onTileCollectionReady() [layout]=currentLayout></tile-collection></div>
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

  public onHint() {
    // trigger hint of collection
    // TODO search for matching free tiles and wiggle
  }

  public onUndo() {

  }

  public onRedo() {

  }

  public onRestart() {
    this.tileCollection.reset();
    this.status.reset();
  }
}

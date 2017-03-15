import { Component, ViewChild } from '@angular/core';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';

@Component({
  selector: 'mj-game',
  template: `
    <style>
      .gamefield {
        position: relative;
        width: 100%;
        height: 90vh;
        border: 1px solid black;
        border-radius: 1%;
      }
    </style>
    <status (hint)=onShowHint() (undo)=onUndo() (redo)=onRedo() [hintsCount]=3></status>
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

  private desiredWidth: number = 1024;
  private desiredHeight: number = 768;

  // private fieldPixelWidth: number;
  // private fieldPixelHeight: number;

  private scale: number;
  private scaleX: number;
  public currentLayout: string = null;

  ngOnInit(): void {
    // load layout
    console.log("loading started");     // TODO show "loading"
    this.currentLayout = "dragon";
  }

  onTileCollectionReady():void {

    // TODO clean up
    // this.fieldPixelWidth = (this.tileCollection.tilePixelWidth/2)*this.tileCollection.fieldDimensionX+6+3;
    // this.fieldPixelHeight = (this.tileCollection.tilePixelHeight/2)*this.tileCollection.fieldDimensionY+8+3;
    // this.scaleX = Math.floor(this.desiredWidth/this.fieldPixelWidth*100)/100;
    // this.scale = Math.floor(Math.min(this.desiredWidth/this.fieldPixelWidth,this.desiredHeight/this.fieldPixelHeight)*100)/100;

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

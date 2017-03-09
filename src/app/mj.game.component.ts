import { Component, ViewChild } from '@angular/core';
import { MjTile, MjTileType } from './mj.tile';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';

@Component({
  selector: 'mj-game',
  template: `
    <status (hint)=onShowHint() (undo)=onUndo() (redo)=onRedo() [hintsCount]=3></status>
    <tile-collection (ready)=onTileCollectionReady() [layout]=currentLayout></tile-collection>
    <options></options>
  `,
  styleUrls: ['app/mj.game.component.css']
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
  
  private fieldPixelWidth: number;
  private fieldPixelHeight: number;

  private debug: true;

  private scale: number;
  private scaleX: number;

  private selectedTile: MjTile = null;

  public currentLayout: string = null;

  ngOnInit(): void {
    // load layout
    console.log("loading started");     // TODO show "loading"
    this.currentLayout = "dragon";
  }

  onTileCollectionReady():void {
    this.fieldPixelWidth = (this.tileCollection.tilePixelWidth/2)*this.tileCollection.fieldDimensionX+6+3;
    this.fieldPixelHeight = (this.tileCollection.tilePixelHeight/2)*this.tileCollection.fieldDimensionY+8+3;
    this.scaleX = Math.floor(this.desiredWidth/this.fieldPixelWidth*100)/100;
    this.scale = Math.floor(Math.min(this.desiredWidth/this.fieldPixelWidth,this.desiredHeight/this.fieldPixelHeight)*100)/100;

    console.log("loading finished"); // TODO hide "loading"
  }

  onTileSelect(tile: MjTile) : void {
    console.log("onTileSelect", tile);
    // checking .active because still can get clicks on the tile while "hiding" animation is playing
    if (tile.active) {
      if (tile.selected) {
        tile.unselect();
        this.selectedTile = null;
      } else {
        if (tile.isFree()) {
          tile.select();

          if (this.selectedTile) {
            if (tile.matches(this.selectedTile)) {
              tile.remove();
              this.selectedTile.remove();
              this.selectedTile = null;
            } else {
              this.selectedTile.unselect();
              this.selectedTile = tile;
            }
          } else {
            this.selectedTile = tile;
          }
        } else {
          // TODO play "blocked" sound and animation
        }
      }
    }
  }

  public onHint() {
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

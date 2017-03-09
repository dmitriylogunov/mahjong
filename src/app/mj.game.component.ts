import { Component } from '@angular/core';
import { MjTile, MjTileType } from './mj.tile';
import { MJTileCollection } from './mj.tile-collection';

@Component({
  selector: 'mj-game',
  templateUrl: 'app/mj.game.component.html',
  styleUrls: ['app/mj.game.component.css']
})
export class MjGameComponent {
  constructor() {
  }

  private hintsCount: number = 0;

  private desiredWidth: number = 1024;
  private desiredHeight: number = 768;

  private tilePixelWidth: number = 200; // pixel width of tile, with "3d" part, margins etc.
  private tilePixelHeight: number = 269; // no other margins are added to tiles

  private fieldPixelWidth: number;
  private fieldPixelHeight: number;

  private debug: true;

  private scale: number;
  private scaleX: number;

  private selectedTile: MjTile = null;

  // layout description only, no other data here. Just an array of tile 2d coordinates
  private dragonLayout: [number, number][] = [
    // layer 0
    [2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],[20,0],[22,0],[24,0],
                [6,2],[8,2],[10,2],[12,2],[14,2],[16,2],[18,2],[20,2],
          [4,4],[6,4],[8,4],[10,4],[12,4],[14,4],[16,4],[18,4],[20,4],[22,4],
    [2,6],[4,6],[6,6],[8,6],[10,6],[12,6],[14,6],[16,6],[18,6],[20,6],[22,6],[24,6],
    [0,7],[26,7],[28,7],
    [2,8],[4,8],[6,8],[8,8],[10,8],[12,8],[14,8],[16,8],[18,8],[20,8],[22,8],[24,8],
           [4,10],[6,10],[8,10],[10,10],[12,10],[14,10],[16,10],[18,10],[20,10],[22,10],
                  [6,12],[8,12],[10,12],[12,12],[14,12],[16,12],[18,12],[20,12],
    [2,14],[4,14],[6,14],[8,14],[10,14],[12,14],[14,14],[16,14],[18,14],[20,14],[22,14],[24,14],
    // layer 1
    [8,2],[10,2],[12,2],[14,2],[16,2],[18,2],
    [8,4],[10,4],[12,4],[14,4],[16,4],[18,4],
    [8,6],[10,6],[12,6],[14,6],[16,6],[18,6],
    [8,8],[10,8],[12,8],[14,8],[16,8],[18,8],
    [8,10],[10,10],[12,10],[14,10],[16,10],[18,10],
    [8,12],[10,12],[12,12],[14,12],[16,12],[18,12],
    // layer 2
    [10,4],[12,4],[14,4],[16,4],
    [10,6],[12,6],[14,6],[16,6],
    [10,8],[12,8],[14,8],[16,8],
    [10,10],[12,10],[14,10],[16,10],
    // layer 3
    [12,6],[14,6],
    [12,8],[14,8],
    // layer 4
    [13,7]
  ];


  public tileCollection: MJTileCollection = null;

  ngOnInit(): void {
    console.log("initialisation started");

    let newTileCollection: MJTileCollection = new MJTileCollection(this.dragonLayout);

    // load layout
    console.log("loading started");     // TODO show "loading"
    newTileCollection.init(this.onLoadComplete.bind(this));
  }

  onLoadComplete(newCollection: MJTileCollection):void {
    this.fieldPixelWidth = (this.tilePixelWidth/2)*newCollection.fieldDimensionX+6+3;
    this.fieldPixelHeight = (this.tilePixelHeight/2)*newCollection.fieldDimensionY+8+3;
    this.scaleX = Math.floor(this.desiredWidth/this.fieldPixelWidth*100)/100;
    this.scale = Math.floor(Math.min(this.desiredWidth/this.fieldPixelWidth,this.desiredHeight/this.fieldPixelHeight)*100)/100;

    this.tileCollection = newCollection;

    this.startGame();

    console.log("loading finished"); // TODO hide "loading"
  }

  public startGame(): void {
    this.tileCollection.reset();
    this.hintsCount = 3;
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
    this.startGame();
  }
}

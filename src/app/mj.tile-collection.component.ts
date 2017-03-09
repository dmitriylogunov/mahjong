import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MjTile, MjTileType } from './mj.tile';
import { AppToolbox } from './app.toolbox';

@Component({
  selector: 'tile-collection',
  templateUrl: 'app/mj.tile-collection.component.html',
  styleUrls: ['app/mj.tile-collection.component.css']
})
export class MJTileCollectionComponent {
  @Input()
  set layout(layout: string) {
    if (layout=="dragon") {
      // init tile structures
      this.initTiles(this.dragonLayout);

      // shuffle tile types
      this.shuffleTypesFisherYates();
    }
  }

  @Output() ready: EventEmitter<any> = new EventEmitter();

  public tiles: MjTile[] = [];

  public fieldDimensionX = 0;
  public fieldDimensionY = 0;

  private tilePixelWidth: number = 200; // pixel width of tile, with "3d" part, margins etc.
  private tilePixelHeight: number = 269; // no other margins are added to tiles


  // tile type group name / number of tiles in a group / can any tile of the group match another of same group or not
  private tileTypesDescriptor: [string, number, boolean][] = [
    ["ball",9,false],["ball",9,false],["ball",9,false],["ball",9,false],
    ["bam",9,false],["bam",9,false],["bam",9,false],["bam",9,false],
    ["num",9,false],["num",9,false],["num",9,false],["num",9,false],
    ["season",4,true],
    ["wind",4,false],["wind",4,false],["wind",4,false],["wind",4,false],
    ["flower",4,true],
    ["dragon",3,false],["dragon",3,false],["dragon",3,false],["dragon",3,false]
  ];

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

  constructor() {
  }

  private initTiles(collection: [number, number][]) {
    // init tile collection
    for (let coordinates of collection) {
      let newTile = new MjTile(coordinates[0], coordinates[1], this.tiles);

      if (this.fieldDimensionX<newTile.x+newTile.tileSizeX) {
        this.fieldDimensionX = newTile.x+newTile.tileSizeX;
      }
      if (this.fieldDimensionY<newTile.y+newTile.tileSizeY) {
        this.fieldDimensionY = newTile.y+newTile.tileSizeY;
      }

      this.tiles.push(newTile);
    }

    // sort tiles for correct display
    this.tiles
      .sort((tile1: MjTile, tile2:MjTile) => tile1.sortingOrder - tile2.sortingOrder)

    // set tile types
    this.setTileTypes();

    // determine which tiles block which
    this.buildTileRelationsGraph();
  }

  private buildTileRelationsGraph() : void {
    for (let i=0; i<this.tiles.length-1; i++) {
      for (let j=i+1; j<this.tiles.length; j++) {
        // check
        this.tiles[i].checkRelativePositions(this.tiles[j]);
        // and vice versa
        this.tiles[j].checkRelativePositions(this.tiles[i]);
      }
    }
    this.ready.emit();
  }

  public shuffleTypesFisherYates(): void {
    for (let i=this.tiles.length-1;i>0;i--) {
      let j = AppToolbox.random(i+1);
      //swap
      let tempType = this.tiles[i].type;
      this.tiles[i].type = this.tiles[j].type;
      this.tiles[j].type = tempType;
    }
  }

  public setTileTypes() {
    let tileIndex = 0;
    for (let type of this.tileTypesDescriptor) {
      for (let i=0;i<type[1];i++) {
        let tileType: MjTileType = new MjTileType(
          type[0],
          i,
          type[2]
        )
        this.tiles[tileIndex++].setType(tileType);
      }
    }
  }

  public reset() {
    for (let tile of this.tiles) {
      tile.reset();
    }
    this.shuffleTypesFisherYates();
  }
}

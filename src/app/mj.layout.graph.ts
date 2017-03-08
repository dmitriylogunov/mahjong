import { MjTile, MjTileType } from './mj.tile';
import { AppToolbox } from './app.toolbox';


// TODO merge this class into TileCollection
export class MJLayoutGraph {
  public tiles: MjTile[] = [];

  public fieldDimensionX = 0;
  public fieldDimensionY = 0;

  constructor(collection: [number, number][]) {
    // init tile collection
    for (let coordinates of collection) {
      let newTile = new MjTile(coordinates[0], coordinates[1]);
      newTile.z = this.getTileZCoordinate(newTile);
      if (this.fieldDimensionX<newTile.x+newTile.tileSizeX) {
        this.fieldDimensionX = newTile.x+newTile.tileSizeX;
      }
      if (this.fieldDimensionY<newTile.y+newTile.tileSizeY) {
        this.fieldDimensionY = newTile.y+newTile.tileSizeY;
      }

      // sort by Z asc, then by Y asc, then by X desc
      newTile.sortingOrder = newTile.z*10000 + newTile.y*100 - newTile.x;
      this.tiles.push(newTile);

    }
  }

  // determine layer (z coordinate) of the tile
  private getTileZCoordinate(tile: MjTile): number {
    let z=0;
    for (let otherTile of this.tiles) {
      if ((z<=otherTile.z) && tile.overlaps2d(otherTile)) {
        z = otherTile.z + 1;
      }
    }
    return z;
  }

  // TODO make async
  public build(success: (layout: MJLayoutGraph) => void) : void {
    for (let i=0; i<this.tiles.length-1; i++) {
      for (let j=i+1; j<this.tiles.length; j++) {
        // check
        this.tiles[i].checkRelativePositions(this.tiles[j]);
        // and vice versa
        this.tiles[j].checkRelativePositions(this.tiles[i]);
      }
    }
    success(this);
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

  public setTypes(tileTypesDescriptor:[string,number,boolean][]) {
    let tileIndex = 0;
    for (let type of tileTypesDescriptor) {
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

  public resetTiles(tileTypesDescriptor: [string, number, boolean][]) {
    this.setTypes(tileTypesDescriptor);
    this.shuffleTypesFisherYates();
  }
}

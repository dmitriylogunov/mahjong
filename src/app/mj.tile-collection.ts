import { MjTile, MjTileType } from './mj.tile';
import { AppToolbox } from './app.toolbox';

export class MJTileCollection {
  public tiles: MjTile[] = [];

  public fieldDimensionX = 0;
  public fieldDimensionY = 0;

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

  constructor(collection: [number, number][]) {
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
  }

  // initialisation might be lengthy, that's why this is a separate function
  // from constructor, with callback on success
  public init(success: (collection: MJTileCollection) => void) {
    // do initialisation asynchronously
    setTimeout(
      () => {
        // sort tiles for correct display
        this.tiles
          .sort((tile1: MjTile, tile2:MjTile) => tile1.sortingOrder - tile2.sortingOrder);

        this.setTypes();
        this.shuffleTypesFisherYates();

        this.build(success);
      },
      1
    );
  }

  private build(success: (collection: MJTileCollection) => void) : void {
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

  public setTypes() {
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

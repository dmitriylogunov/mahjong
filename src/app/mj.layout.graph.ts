import { MjTile } from './mj.tile';

export class MJLayoutGraph {
  public tiles: MjTile[] = [];
  private graph: {};

  constructor(collection: [number, number][]) {
    // init tile collection
    for (let coordinates of collection) {
      let newTile = new MjTile(coordinates[0], coordinates[1]);
      newTile.z = this.getTileZCoordinate(newTile);
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
  public build(cachedGraph: {}, success: (layout: MJLayoutGraph) => void) : void {

    // graph may be already initialised from cache
    if (!cachedGraph.hasOwnProperty('a')) {
      // for (let tile in tiles) {
      //
      // }
    }
    success(this);
  }
}

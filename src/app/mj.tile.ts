export class MjTileType {
  constructor (group: string, index: number, matchAny: boolean) {
    this.group = group;
    this.index = index;
    this.matchAny = matchAny;
  }
  public group: string;
  public index: number;
  public matchAny: boolean;
}

export class MjTile {
  public top: number; // top and left are pixel positions of the tile
  public left: number;
  public type: MjTileType = null;
  public x: number;
  public y: number;
  public z: number; // x,y,z are field positions of the tile

  public sortingOrder : number;

  public selected: boolean = false;
  public active: boolean = true;

  public tileSizeX = 2;
  public tileSizeY = 2;

  public blockedBy: MjTile[] = [];
  public adjacentL: MjTile[] = [];
  public adjacentR: MjTile[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.z = 0;
  }

  setType(type: MjTileType): void {
    this.type = type;
  }

  // check if two tile overlap, ignoring z coordinate
  overlaps2d(otherTile: MjTile): boolean {
    return (
      (this.x+this.tileSizeX>otherTile.x && this.x<otherTile.x+otherTile.tileSizeX)
      &&
      (this.y+this.tileSizeY>otherTile.y && this.y<otherTile.y+otherTile.tileSizeY)
    );
  }

  // returns [isOnLeft, isOnRight]
  isXAdjacentTo(otherTile: MjTile): [boolean, boolean] {
    if (
      (this.z == otherTile.z)
      &&
      (this.y+this.tileSizeY>otherTile.y && this.y<otherTile.y+otherTile.tileSizeY) // same rule as in overlap for Y
    ) {
    return (
      [
        this.x+this.tileSizeX==otherTile.x, // Adjacent on left
        this.x==otherTile.x+otherTile.tileSizeX // Adjacent on right
      ]
    )
    } else {
      return [false, false];
    }
  }

  checkRelativePositions(otherTile: MjTile): void {
    if (this.z==otherTile.z-1 && this.overlaps2d(otherTile)) {
        this.blockedBy.push(otherTile);
    }
    let adjacency = this.isXAdjacentTo(otherTile);
    if (adjacency[0]) {
      this.adjacentL.push(otherTile);
    } else if (adjacency[1]) {
      this.adjacentR.push(otherTile);
    }
  }

  // whether this tile is a match to other tile or not (tile will also match to itself if compared)
  matches(otherTile: MjTile): boolean {
    if (!otherTile) {
      return false;
    } else if (this.type.matchAny && this.type.group===otherTile.type.group) {
      // Season or flower tiles that all match to each other
      return true;
    } else if (this.type.group===otherTile.type.group && this.type.index == otherTile.type.index) {
      // Other tiles
      return true;
    } else {
      return false;
    }
  }

  isFree(): boolean {
    for (let tile of this.blockedBy) {
      if (tile.active) {
        return false;
      }
    }

    // adjacent on left
    let freeOnLeft = true;
    for (let tile of this.adjacentL) {
      if (tile.active) {
        freeOnLeft = false;
        break;
      }
    }

    if (freeOnLeft) {
      return true;
    }

    // adjacent on right
    let freeOnRight = true;
    for (let tile of this.adjacentR) {
      if (tile.active) {
        freeOnRight = false;
        break;
      }
    }

    return freeOnRight;
  }

  remove(): void {
    this.active = false;
    setTimeout(
      () => {
        this.unselect();
      },
      500
    );
  }

  select(): void {
    this.selected = true;
    // TODO trigger play of "select" animation
  }

  unselect(): void {
    this.selected = false;
    // TODO trigger play of "unselect" animation
  }
}

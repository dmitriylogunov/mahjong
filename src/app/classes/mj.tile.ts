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
  public showHint: boolean = false;
  public hasFreePair: boolean = false;

  public tileSizeX = 2;
  public tileSizeY = 2;

  public blockedBy: MjTile[] = [];
  public adjacentL: MjTile[] = [];
  public adjacentR: MjTile[] = [];

  constructor(x: number, y: number, collection: MjTile[]) {
    this.x = x;
    this.y = y;
    this.z = this.getTileZCoordinate(collection);

    // collection will be sorted later: by Z asc, then by Y asc, then by X desc,
    // sortingOrder is integer that reflect position of tile in above sort
    this.sortingOrder = this.z*10000 - this.x*100 + this.y;
  }

  // determine layer (z coordinate) of the tile
  // there is an assumption that tiles with layer 0 come first in init array,
  // then layer 1 etc
  private getTileZCoordinate(collection: MjTile[]): number {
    let z=0;
    for (let otherTile of collection) {
      if ((z<=otherTile.z) && this.overlaps2d(otherTile)) {
        z = otherTile.z + 1;
      }
    }
    return z;
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
    } else {
      return this.type.matches(otherTile.type);
    }
  }

  public isFree: boolean = false;

  public refreshIsFreeStatus(): void {
    this.isFree = this.getIsFreeStatus();
  }

  private getIsFreeStatus(): boolean {
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

  public remove(): void {
    this.active = false;
    // TODO play fade out animation
    setTimeout(
      () => {
        this.unselect();
      },
      500
    );
  }

  public returnToField(): void {
    this.active = true;
    // TODO play fade in animation
  }

  public select(): void {
    this.selected = true;
    // TODO trigger play of "select" animation
  }

  public unselect(): void {
    this.selected = false;
    // TODO trigger play of "unselect" animation
  }

  // return to initial state
  public reset(): void {
    this.unselect();
    this.active = true;
  }

  public startHint(): void {
    this.showHint = true;
  }

  public stopHint(): void {
    this.showHint = false;
  }
}

interface TileCharacters {
  [group: string]: string[][];
}

export class MjTileType {
  constructor (group: string, index: number, matchAny: boolean) {
    this.group = group;
    this.index = index;
    this.matchAny = matchAny;
  }
  public group: string;
  public index: number;
  public matchAny: boolean; // Season or flower tiles that all match to each other

  private tileCharacters: TileCharacters = {
    "ball": [["&#x1F019","1","blue"], ["&#x1F01A","2","blue"], ["&#x1F01B","3","blue"], ["&#x1F01C","4","blue"],
      ["&#x1F01D","5","blue"], ["&#x1F01E","6","blue"], ["&#x1F01F","7","blue"], ["&#x1F020","8","blue"], ["&#x1F021","9","blue"] ],
    "bam": [["&#x1F010","1","green"], ["&#x1F011","2","green"], ["&#x1F012","3","green"], ["&#x1F013","4","green"],
      ["&#x1F014","5","green"], ["&#x1F015","6","green"], ["&#x1F016","7","green"], ["&#x1F017","8","green"], ["&#x1F018","9","green"] ],
    "num": [["&#x1F007","1","red"], ["&#x1F008","2","red"], ["&#x1F009","3","red"], ["&#x1F00A","4","red"],
      ["&#x1F00B","5","red"], ["&#x1F00C","6","red"], ["&#x1F00D","7","red"], ["&#x1F00E","8","red"], ["&#x1F00F","9","red"] ],
    "season": [["&#x1F026", "spring", "green"], ["&#x1F027", "summer", "darkyellow"], ["&#x1F028", "autumn", "orange"], ["&#x1F029", "winter", "blue"]],
    "wind": [["&#x1F000", "east", "black"], ["&#x1F001", "south", "black"], ["&#x1F002", "west", "black"], ["&#x1F003", "north", "black"]],
    "flower": [["&#x1F022", "plum", "pink"], ["&#x1F023", "orchid", "green"], ["&#x1F024", "bamboo", "green"], ["&#x1F025", "mum", "red"]],
    "dragon": [["&#x1F004", "dragon", "red"], ["&#x1F005", "dragon", "green"], ["&#x1F006", "dragon", "blue"]]
  }

  public getPrimaryCharacter(): string {
    return this.tileCharacters[this.group][this.index][0];
  }

  public getSecondaryCharacter(): string {
    return this.tileCharacters[this.group][this.index][1];
  }

  public getColor(): string {
    // console.log(this.group, this.index);
    return this.tileCharacters[this.group][this.index][2];
  }

  public matches(otherType: MjTileType) {
    if (this.group===otherType.group && (this.matchAny || this.index == otherType.index)) {
      return true;
    } else {
      return false;
    }
  }

  public toString(): string {
    return this.group + this.index.toString();
  }

}

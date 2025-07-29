import { TileCharacters } from '@/types/game.types';

export class MjTileType {
  public group: string;
  public index: number;
  public matchAny: boolean;

  private tileCharacters: TileCharacters = {
    "ball": [["&#x1F019","1","blue"], ["&#x1F01A","2","blue"], ["&#x1F01B","3","blue"], ["&#x1F01C","4","blue"],
      ["&#x1F01D","5","blue"], ["&#x1F01E","6","blue"], ["&#x1F01F","7","blue"], ["&#x1F020","8","blue"], ["&#x1F021","9","blue"] ],
    "bam": [["&#x1F010","1","green"], ["&#x1F011","2","green"], ["&#x1F012","3","green"], ["&#x1F013","4","green"],
      ["&#x1F014","5","green"], ["&#x1F015","6","green"], ["&#x1F016","7","green"], ["&#x1F017","8","green"], ["&#x1F018","9","green"] ],
    "num": [["&#x1F007","1","red"], ["&#x1F008","2","red"], ["&#x1F009","3","red"], ["&#x1F00A","4","red"],
      ["&#x1F00B","5","red"], ["&#x1F00C","6","red"], ["&#x1F00D","7","red"], ["&#x1F00E","8","red"], ["&#x1F00F","9","red"] ],
    "season": [["&#x1F026", "spring", "green"], ["&#x1F027", "summer", "#D4A017"], ["&#x1F028", "autumn", "orange"], ["&#x1F029", "winter", "blue"]],
    "wind": [["&#x1F000", "east", "black"], ["&#x1F001", "south", "black"], ["&#x1F002", "west", "black"], ["&#x1F003", "north", "black"]],
    "flower": [["&#x1F022", "plum", "#C71585"], ["&#x1F023", "orchid", "green"], ["&#x1F024", "bamboo", "green"], ["&#x1F025", "mum", "red"]],
    "dragon": [["&#x1F004", "dragon", "red"], ["&#x1F005", "dragon", "green"], ["龙", "dragon", "#4169E1"]]
  }

  constructor (group: string, index: number, matchAny: boolean) {
    this.group = group;
    this.index = index;
    this.matchAny = matchAny;
  }

  public getPrimaryCharacter(): string {
    return this.tileCharacters[this.group][this.index][0];
  }

  public getSecondaryCharacter(): string {
    return this.tileCharacters[this.group][this.index][1];
  }

  public getColor(): string {
    return this.tileCharacters[this.group][this.index][2];
  }

  public matches(otherType: MjTileType) {
    if (this.group === otherType.group && (this.matchAny || this.index === otherType.index)) {
      return true;
    } else {
      return false;
    }
  }

  public toString(): string {
    return this.group + this.index.toString();
  }
}

export class MjTile {
  public top: number;
  public left: number;
  public type: MjTileType | null = null;
  public x: number;
  public y: number;
  public z: number;
  public sortingOrder: number;
  public selected: boolean = false;
  public active: boolean = true;
  public showHint: boolean = false;
  public hasFreePair: boolean = false;
  public tileSizeX = 2;
  public tileSizeY = 2;
  public blockedBy: MjTile[] = [];
  public adjacentL: MjTile[] = [];
  public adjacentR: MjTile[] = [];
  public chaosOffsetX: number = 0;
  public chaosOffsetY: number = 0;
  public chaosRotation: number = 0;

  constructor(x: number, y: number, collection: MjTile[]) {
    this.x = x;
    this.y = y;
    this.z = this.getTileZCoordinate(collection);
    this.top = 0;
    this.left = 0;
    this.sortingOrder = this.z * 10000 - this.x * 100 + this.y;
  }

  private getTileZCoordinate(collection: MjTile[]): number {
    let z = 0;
    for (const otherTile of collection) {
      if ((z <= otherTile.z) && this.overlaps2d(otherTile)) {
        z = otherTile.z + 1;
      }
    }
    return z;
  }

  setType(type: MjTileType): void {
    this.type = type;
  }

  overlaps2d(otherTile: MjTile): boolean {
    return (
      (this.x + this.tileSizeX > otherTile.x && this.x < otherTile.x + otherTile.tileSizeX)
      &&
      (this.y + this.tileSizeY > otherTile.y && this.y < otherTile.y + otherTile.tileSizeY)
    );
  }

  isXAdjacentTo(otherTile: MjTile): [boolean, boolean] {
    if (
      (this.z === otherTile.z)
      &&
      (this.y + this.tileSizeY > otherTile.y && this.y < otherTile.y + otherTile.tileSizeY)
    ) {
      return [
        this.x + this.tileSizeX === otherTile.x,
        this.x === otherTile.x + otherTile.tileSizeX
      ];
    } else {
      return [false, false];
    }
  }

  checkRelativePositions(otherTile: MjTile): void {
    if (this.z === otherTile.z - 1 && this.overlaps2d(otherTile)) {
      this.blockedBy.push(otherTile);
    }
    const adjacency = this.isXAdjacentTo(otherTile);
    if (adjacency[0]) {
      this.adjacentL.push(otherTile);
    } else if (adjacency[1]) {
      this.adjacentR.push(otherTile);
    }
  }

  matches(otherTile: MjTile): boolean {
    if (!otherTile || !this.type || !otherTile.type) {
      return false;
    } else {
      return this.type.matches(otherTile.type);
    }
  }

  isFree(): boolean {
    for (const tile of this.blockedBy) {
      if (tile.active) {
        return false;
      }
    }

    let freeOnLeft = true;
    for (const tile of this.adjacentL) {
      if (tile.active) {
        freeOnLeft = false;
        break;
      }
    }

    if (freeOnLeft) {
      return true;
    }

    let freeOnRight = true;
    for (const tile of this.adjacentR) {
      if (tile.active) {
        freeOnRight = false;
        break;
      }
    }

    return freeOnRight;
  }

  public remove(): void {
    this.active = false;
    this.unselect();
  }

  public returnToField(): void {
    this.active = true;
  }

  public select(): void {
    this.selected = true;
  }

  public unselect(): void {
    this.selected = false;
  }

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
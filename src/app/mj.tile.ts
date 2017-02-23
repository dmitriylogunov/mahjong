// import { Component, Input } from '@angular/core';
//
// @Component({
//   selector: 'tile',
//   template: '<div class="tile" [ngStyle]="positionStyles">AAA</div>',
// })
export class MjTile {
  // scaling constants to determine resulting pixel size of a tile
  // should be tile size in pixels / 2 (logical size of tile is 2x2) + margins
  private xScale:number = 31;
  private yScale:number = 46;
  public top: number; // top and left are pixel positions of the tile
  public left: number;
  public type: string;
  public isFree: boolean;
  // @Input() x: number;
  // @Input() y: number;
  public x: number;
  public y: number;
  public z: number; // x,y,z are field positions of the tile

  private tileSizeX = 2;
  private tileSizeY = 2;

  private blockedBy: {};
  private blocks: {};

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.left = this.x*this.xScale;
    this.top = this.y*this.yScale;

    this.z = 0;
  }

  setType(type: string): void {
    // TODO add tile image here
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
}

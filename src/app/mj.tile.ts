// import { Component, Input } from '@angular/core';
//
// @Component({
//   selector: 'tile',
//   template: '<div class="tile" [ngStyle]="positionStyles">AAA</div>',
// })
export class MjTile {
  private vScale:number = 10; // scaling constants to determine pixel size of a tile
  private hScale:number = 5;
  public top: number; // top and left are pixel positions of the tile
  public left: number;
  public positionStyles: {};
  public type: string;
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
    this.x = 0;//initPosition[0];
    this.y = 0;//initPosition[1];
    console.log("In tile constructor " + this.x + " " + this.y);
    this.left = this.x*this.hScale;
    this.top = this.y*this.vScale;
    this.positionStyles = {
      'top': this.top+'px',
      'left': this.left+'px'
    };
    this.z = 0;
  }

  // check if two tile overlap, ignoring z coordinate
  overlaps2d(otherTile: MjTile): boolean {
    return (
      (this.x+this.tileSizeX>otherTile.x && this.x<=otherTile.x+this.tileSizeX)
      &&
      (this.y+this.tileSizeY>otherTile.y && this.y<=otherTile.y+this.tileSizeY)
    );
  }
}

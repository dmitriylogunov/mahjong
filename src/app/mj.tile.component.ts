import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MjTile, MjTileType } from './mj.tile';

@Component({
  selector: 'tile',
  templateUrl: 'app/mj.tile.component.html',
  styleUrls: ['app/mj.tile.component.css']
})
export class MjTileComponent {
  // constants
  public shiftProportion: number = 0.12;
  public debug: boolean = false;

  //   <div class="test" [innerHTML]="tileUnicode"></div>
  @Input()
  x: number;

  @Input()
  y: number;

  @Input()
  z: number;

  public _elementPixelWidth: number;
  public shiftX: number;

  @Input()
  set elementPixelWidth(elementPixelWidth: number) {
    this._elementPixelWidth = elementPixelWidth;
    this.shiftX = Math.floor(elementPixelWidth*this.shiftProportion);
    // console.log(this.shiftX);
  }

  public _elementPixelHeight: number;
  public shiftY: number;
  public fontSizePrimary: number;
  public fontSizeSecondary: number;

  @Input()
  set elementPixelHeight(elementPixelHeight: number) {
    this._elementPixelHeight = elementPixelHeight;
    this.shiftY = Math.floor(elementPixelHeight*this.shiftProportion);
    // console.log(this.shiftY);
    this.fontSizePrimary =  Math.floor(elementPixelHeight*1.4);
    this.fontSizeSecondary = Math.floor(elementPixelHeight / 3);

    console.log(this.fontSizePrimary);
  }

  @Input()
  active: boolean;

  @Input()
  set selected(selected: boolean) {
    this._selected = selected;
    // TODO play of "select" or "unselect" animation
  }
  _selected: boolean;

  @Input()
  isFree: boolean;

  @Input()
  set type(type: MjTileType) {
    this._type = type;
  }

  public _type: MjTileType;

  @Output() click: EventEmitter<any> = new EventEmitter();

  constructor() {
    // console.log("New tile");
  }

  onClick() {
    this.click.emit();
  }
}

  // 'background-image': 'url(/img/tiles/' + _type.group + _type.index + '.png)'

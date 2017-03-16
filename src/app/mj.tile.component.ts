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

  _elementPixelWidth: number;
  shiftX: number;

  @Input()
  set elementPixelWidth(elementPixelWidth: number) {
    this._elementPixelWidth = elementPixelWidth;
    this.shiftX = Math.floor(elementPixelWidth*this.shiftProportion);
    console.log(this.shiftX);
  }

  _elementPixelHeight: number;
  shiftY: number;

  @Input()
  set elementPixelHeight(elementPixelHeight: number) {
    this._elementPixelHeight = elementPixelHeight;
    this.shiftY = Math.floor(elementPixelHeight*this.shiftProportion);
    console.log(this.shiftY);
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

    // TODO case ...
    this.primaryCharacter = "&#x1F000; &#x1F02A;";
    this.secondaryCharacter = "B";
  }

  public _type: MjTileType;

  private primaryCharacter: string = "";
  private secondaryCharacter: string = "";

  @Output() click: EventEmitter<any> = new EventEmitter();

  constructor() {
    console.log("New tile");
  }

  onClick() {
    this.click.emit();
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MjTile, MjTileType } from './mj.tile';

@Component({
  selector: 'tile',
  templateUrl: 'app/mj.tile.component.html',
  styleUrls: ['app/mj.tile.component.css']
})
export class MjTileComponent {
  // constants
  public shiftX: number = 6; // both must be odd for integer division in half
  public shiftY: number = 8;
  public debug: boolean = false;

  //   <div class="test" [innerHTML]="tileUnicode"></div>
  @Input()
  x: number;

  @Input()
  y: number;

  @Input()
  z: number;

  @Input()
  elementPixelWidth: number;

  @Input()
  elementPixelHeight: number;

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

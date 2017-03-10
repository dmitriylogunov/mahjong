import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MjTile, MjTileType } from './mj.tile';

@Component({
  selector: 'tile',
  templateUrl: 'app/mj.tile.component.html',
  styleUrls: ['app/mj.tile.component.css']
})
export class MjTileComponent {
  //   <div class="test" [innerHTML]="tileUnicode"></div>
  @Input()
  scaleX: number;

  @Input()
  scaleY: number;

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

  private _type: MjTileType;

  private primaryCharacter: string = "";
  private secondaryCharacter: string = "";

  public shiftX = 3;
  public shiftY = 4;

  @Output() click: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  onClick() {
    this.click.emit();
  }
}

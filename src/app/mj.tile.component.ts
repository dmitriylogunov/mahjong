import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MjTile, MjTileType } from './mj.tile';

@Component({
  selector: 'tile',
  templateUrl: 'app/mj.tile.component.html',
  styleUrls: ['app/mj.tile.component.css']
})
export class MjTileComponent {
  // constants
  public shiftProportion: number = 0.14; // how much shift tile face from tile bottom to create pseudo 3d effect
  public debug: boolean = false;

  //   <div class="test" [innerHTML]="tileUnicode"></div>
  @Input()
  x: number;

  @Input()
  y: number;

  @Input()
  z: number;

  @Input()
  showHints: boolean;

  @Input()
  hasFreePair: boolean;


  public _elementPixelWidth: number;
  public shiftX: number;
  public _elementPixelHeight: number;
  public shiftY: number;
  public fontSizePrimary: number;
  public fontSizeSecondary: number;
  public primaryWrapperWidth: number;
  public primaryWrapperLeftShift: number;

  // TODO this could be outside tile component
  private recalculateFontSizes() {
    if (!this._elementPixelHeight || !this._elementPixelWidth) {
      return;
    }

    let adjustedElementSize = Math.min(
      this._elementPixelHeight,
      this._elementPixelWidth*1.5 // this is approximate proportion of tile font height to font width
    );

    this.fontSizePrimary =  Math.floor(adjustedElementSize*1.5);
    this.fontSizeSecondary = Math.floor(adjustedElementSize / 3);
    // console.log(adjustedElementSize);

    // Primary tile character horizontal centering
    let primaryCharacterAreaWidth = (this._elementPixelWidth*2) - 10; // -2*margin of tile
    this.primaryWrapperWidth = 4*this._elementPixelWidth;
    this.primaryWrapperLeftShift = Math.floor((this.primaryWrapperWidth - primaryCharacterAreaWidth)/2);
  }

  @Input()
  set elementPixelWidth(elementPixelWidth: number) {
    this._elementPixelWidth = elementPixelWidth;
    this.shiftX = Math.floor(elementPixelWidth*this.shiftProportion);
    // console.log(this.shiftX);
    this.recalculateFontSizes();

  }

  @Input()
  set elementPixelHeight(elementPixelHeight: number) {
    this._elementPixelHeight = elementPixelHeight;
    this.shiftY = Math.floor(elementPixelHeight*this.shiftProportion);
    // console.log(this.shiftY);
    this.recalculateFontSizes();
  }

  @Input()
  active: boolean;

  _selected: boolean = false;
  @Input()
  set selected(selected: boolean) {
    if (!this._selected && selected) {
      // play "select" animation
    } else if (this._selected && !selected){
      // play "unselect"
    }
    this._selected = selected;
  }

  @Input()
  isFree: boolean;

  @Input()
  set type(type: MjTileType) {
    this._type = type;
  }

  public _type: MjTileType;

  @Output() tileClicked: EventEmitter<any> = new EventEmitter();

  constructor() {
    // console.log("New tile");
  }

  onClick(event: any) {
    this.tileClicked.emit();
    event.stopPropagation();
  }
}

  // 'background-image': 'url(/img/tiles/' + _type.group + _type.index + '.png)'

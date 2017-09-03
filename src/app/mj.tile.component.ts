import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MjGameControlService } from './services/mj.game.control.service';
import { MjTile, MjTileType } from './classes/mj.tile';
import { Subscription } from 'rxjs/Subscription'

// shadow 2
// 'top.px': -shiftX,
// 'left.px': shiftY,

// tile
// 'top.px': -shiftX*2,
// 'left.px': shiftY*2,


// Tile must be minimal because there are many and if they have lots of inputs,
// it slows down browser
@Component({
  selector: 'tile',
  templateUrl: 'templates/mj.tile.component.html',
  styleUrls: ['styles/mj.tile.component.css']
})
export class MjTileComponent implements OnDestroy {
  // constants
  public debug: boolean = false;

  // just the tile object with all metadata. It doesn't change often
  // @Input()
  // tile: MjTile;

  @Input()
  isFree: boolean;

  @Input()
  isVisible: boolean;

  // this input does not change
  @Input()
  top: number;

  // this input does not change
  @Input()
  left: number;

  @Input()
  height: number;

  @Input()
  width: number;

  @Input()
  type: MjTileType;

  // <div class="test" [innerHTML]="tileUnicode"></div>

  // @Input()
  // showHints: boolean;


  // @Input()
  // set elementPixelHeight(elementPixelHeight: number) {
  //   this._elementPixelHeight = elementPixelHeight;
  // }

  public selected: boolean = false;
  // @Input()
  // set selected(selected: boolean) {
  //   if (!this._selected && selected) {
  //     // play "select" animation
  //   } else if (this._selected && !selected){
  //     // play "unselect"
  //   }
  //   this._selected = selected;
  // }

  // @Input()
  // set type(type: MjTileType) {
  //   this._type = type;
  // }
  //
  // public _type: MjTileType;

  @Output() tileClicked: EventEmitter<any> = new EventEmitter();

  private subscriptions: Subscription[] = [];

  constructor(private gameControlService: MjGameControlService) {
    // subscribe to events
    this.subscriptions.push(gameControlService.updateAllTileSelection$.subscribe(
      selected => {
        this.selected = selected
      }
    ));
  }

  ngOnInit():void {
    console.log("New tile");
    // console.log
  }

  ngOnDestroy(): void {
    // prevent memory leak
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  onClick(event: any) {
    this.tileClicked.emit();
    event.stopPropagation();
  }
}

  // 'background-image': 'url(/img/tiles/' + _type.group + _type.index + '.png)'

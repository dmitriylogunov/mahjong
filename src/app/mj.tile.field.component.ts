import { Component, Input, OnDestroy, Output, EventEmitter, ElementRef } from '@angular/core';
import { MjTileComponent } from './mj.tile.component';
import { MjTile, MjTileType } from './classes/mj.tile';
import { AppToolbox } from './classes/app.toolbox';
import { MjGameControlService } from './services/mj.game.control.service';
import { Subscription }   from 'rxjs/Subscription';
import { MjAudioService } from './services/mj.audio.service';
import { MjUndoQueue } from './classes/mj.undo.queue';
import { MjTileCollection } from './classes/mj.tile.collection';

@Component({
  selector: 'tile-field',
  templateUrl: 'templates/mj.tile.field.component.html',
  styleUrls: ['styles/mj.tile.field.component.css']
})
export class MJTileFieldComponent implements OnDestroy {

  private subscriptions: Subscription[] = [];
  private undoQueue: MjUndoQueue;
  private collection: MjTileCollection;

  // constants
  // constraints in tile scaling (tile == 2x2 elements), proportion = width / Height
  // 1 is square, 0.5 is 2:1 etc
  private elementProportionMax = 0.8; // almost square, which is 1
  private elementProportionMin = 0.7;

  public tilesReady: boolean = false; // local var to let template know that it can draw tiles

  @Input()
  paused: boolean;

  @Input()
  set layout(layout: string) {
    if (layout==="dragon") {
      this.init(this.dragonLayout);
    }
  }

  constructor(private _elRef: ElementRef, private gameControlService: MjGameControlService, private audioService: MjAudioService) {
    // every time the window size changes, recalculate field and tile dimensions
    window.addEventListener("resize", (()=>{this.retrieveDimensionsFromElement();}).bind(this));

    // listen to hint requests and show them
    this.subscriptions.push(gameControlService.hintRequestUpdated$.subscribe(
      status => {
        this.showHints = status;
      }
    ));

    // listen to sound setting
    this.subscriptions.push(gameControlService.soundUpdated$.subscribe(
      status => {
        // update status
        this.playSounds = status;
      }
    ));

    this.undoQueue = new MjUndoQueue();
    this.collection = new MjTileCollection();
  }

  ngOnDestroy(): void {
    // prevent memory leak
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  private init(layout: [number, number][]) {
    this.initTiles(layout);
    this.reset();

    // notify that controller is ready
    this.tilesReady = true;
    this.ready.emit();
  }

  @Output() ready: EventEmitter<any> = new EventEmitter();
  @Output() tileCleared: EventEmitter<any> = new EventEmitter();

  public tiles: MjTile[] = [];
  private selectedTile: MjTile = null;

  public fieldDimensionX = 0;
  public fieldDimensionY = 0;

  public elementPixelWidth: number = 0; // pixel width of tile, with "3d" part, margins etc.
  public elementPixelHeight: number = 0; // no other margins are added to tiles
  private showHints: boolean = false;
  private playSounds: boolean = false;

  public paddingLeft: number = 0;
  public paddingRight: number = 0;
  public paddingTop: number = 0;
  public paddingBottom: number = 0;

  private isVisible: boolean = false;

  public show() {
    this.isVisible = true;
  }

  public hide() {
    this.isVisible = false;
  }

  // TODO wrap into MjTileType class
  // tile type group name / number of tiles in a group / can any tile of the group match another of same group or not
  private tileSetDescriptor: [string, number, boolean][] = [
    ["ball",9,false],["ball",9,false],["ball",9,false],["ball",9,false],
    ["bam",9,false],["bam",9,false],["bam",9,false],["bam",9,false],
    ["num",9,false],["num",9,false],["num",9,false],["num",9,false],
    ["season",4,true],
    ["wind",4,false],["wind",4,false],["wind",4,false],["wind",4,false],
    ["flower",4,true],
    ["dragon",3,false],["dragon",3,false],["dragon",3,false],["dragon",3,false]
  ];

  // layout description only, no other data here. Just an array of tile 2d coordinates
  private dragonLayout: [number, number][] = [
    // layer 0
    [2,0],[4,0],[6,0],[8,0],[10,0],[12,0],[14,0],[16,0],[18,0],[20,0],[22,0],[24,0],
                [6,2],[8,2],[10,2],[12,2],[14,2],[16,2],[18,2],[20,2],
          [4,4],[6,4],[8,4],[10,4],[12,4],[14,4],[16,4],[18,4],[20,4],[22,4],
    [2,6],[4,6],[6,6],[8,6],[10,6],[12,6],[14,6],[16,6],[18,6],[20,6],[22,6],[24,6],
    [0,7],[26,7],[28,7],
    [2,8],[4,8],[6,8],[8,8],[10,8],[12,8],[14,8],[16,8],[18,8],[20,8],[22,8],[24,8],
           [4,10],[6,10],[8,10],[10,10],[12,10],[14,10],[16,10],[18,10],[20,10],[22,10],
                  [6,12],[8,12],[10,12],[12,12],[14,12],[16,12],[18,12],[20,12],
    [2,14],[4,14],[6,14],[8,14],[10,14],[12,14],[14,14],[16,14],[18,14],[20,14],[22,14],[24,14],
    // layer 1
    [8,2],[10,2],[12,2],[14,2],[16,2],[18,2],
    [8,4],[10,4],[12,4],[14,4],[16,4],[18,4],
    [8,6],[10,6],[12,6],[14,6],[16,6],[18,6],
    [8,8],[10,8],[12,8],[14,8],[16,8],[18,8],
    [8,10],[10,10],[12,10],[14,10],[16,10],[18,10],
    [8,12],[10,12],[12,12],[14,12],[16,12],[18,12],
    // layer 2
    [10,4],[12,4],[14,4],[16,4],
    [10,6],[12,6],[14,6],[16,6],
    [10,8],[12,8],[14,8],[16,8],
    [10,10],[12,10],[14,10],[16,10],
    // layer 3
    [12,6],[14,6],
    [12,8],[14,8],
    // layer 4
    [13,7]
  ];

  ngOnInit():void {
    this.retrieveDimensionsFromElement();
  }

  private windowWidth: number = 0;
  private windowHeight: number = 0;

  // recalculate field and tile dimensions
  private retrieveDimensionsFromElement(): void {
    let element: any = this._elRef.nativeElement.parentElement;

    // console.log("retrieveDimensionsFromElement");
    // console.log(element);
    // console.log(element.offsetWidth);
    // console.log(element.offsetHeight);

    // Game field
    this.windowWidth = element.offsetWidth;
    this.windowHeight = element.offsetHeight;

    // element size
    this.elementPixelWidth = Math.floor(this.windowWidth / this.fieldDimensionX);
    this.elementPixelHeight = Math.floor(this.windowHeight / this.fieldDimensionY);
    // console.log(this.elementPixelWidth);
    // console.log(this.elementPixelHeight);

    // check element proportion and adjust if needed
    let currentProportion = this.elementPixelWidth / this.elementPixelHeight;
    // console.log(currentProportion);

    // too much "Portrait"
    if (currentProportion<this.elementProportionMin) {
        this.elementPixelHeight = Math.floor(this.elementPixelWidth / this.elementProportionMin);
    }

    // too much "Landscape"
    if (currentProportion>this.elementProportionMax) {
      this.elementPixelWidth = Math.floor(this.elementPixelHeight * this.elementProportionMax);
    }

    // field padding, so tiles are centered inside the game field
    let totalPaddingX = this.windowWidth - (this.elementPixelWidth * this.fieldDimensionX);
    this.paddingLeft = Math.floor(totalPaddingX / 2) - 5;
    this.paddingRight = totalPaddingX - this.paddingLeft; // accounts for uneven total padding
    // Y - similar
    let totalPaddingY = this.windowHeight - (this.elementPixelHeight * this.fieldDimensionY);
    this.paddingTop = Math.floor(totalPaddingY / 2);
    this.paddingBottom = totalPaddingY - this.paddingTop;

    // console.log(this.elementPixelWidth);
    // console.log(this.elementPixelHeight);
  }

  // arrange tiles into given layout and detect which tile blocks which
  // this function has to be only called once per layout change, and not called on subsequent game restarts
  private initTiles(collection: [number, number][]) {
    this.tiles.length = 0;
    // init tile collection
    for (let coordinates of collection) {
      let newTile = new MjTile(coordinates[0], coordinates[1], this.tiles);

      if (this.fieldDimensionX<newTile.x+1+newTile.tileSizeX) {
        this.fieldDimensionX = newTile.x+1+newTile.tileSizeX;
      }
      if (this.fieldDimensionY<newTile.y+1+newTile.tileSizeY) {
        this.fieldDimensionY = newTile.y+1+newTile.tileSizeY;
      }

      this.tiles.push(newTile);
    }

    // sort tiles for correct display
    this.tiles
      .sort((tile1: MjTile, tile2:MjTile) => tile1.sortingOrder - tile2.sortingOrder)

    // set tile types
    this.setTileTypes();

    // determine which tiles block which
    this.buildTileRelationsGraph();
  }

  private buildTileRelationsGraph() : void {
    for (let i=0; i<this.tiles.length-1; i++) {
      for (let j=i+1; j<this.tiles.length; j++) {
        // check
        this.tiles[i].checkRelativePositions(this.tiles[j]);
        // and vice versa
        this.tiles[j].checkRelativePositions(this.tiles[i]);
      }
    }
  }

  public shuffleTypesFisherYates(): void {
    for (let i=this.tiles.length-1;i>0;i--) {
      let j = AppToolbox.random(i+1);
      //swap
      let tempType = this.tiles[i].type;
      this.tiles[i].type = this.tiles[j].type;
      this.tiles[j].type = tempType;
    }
  }

  public setTileTypes() {
    let tileIndex = 0;
    for (let type of this.tileSetDescriptor) {
      for (let i=0;i<type[1];i++) {
        let tileType: MjTileType = new MjTileType(
          type[0],
          i,
          type[2]
        )
        this.tiles[tileIndex++].setType(tileType);
      }
    }
  }

  public reset(doShuffle: boolean = true) {
    // reset tiles
    for (let tile of this.tiles) {
      tile.reset();
    }
    if (doShuffle) {
      this.shuffleTypesFisherYates();
    }
    this.onFieldUpdate();

    this.visibleTileCount = this.tiles.length;
    this.undoQueue.reset();
  }

  // This is a debug function used to clear first available free tile pair
  clearTilePair() {
    if (this.freePairs.length>0) {
      let tile1: MjTile = this.freePairs[0][0];
      let tile2: MjTile = this.freePairs[0][1];
      this.selectTile(tile1);
      this.selectTile(tile2);
    }
  }

  onTileClick(tile: MjTile) : void {
    this.selectTile(tile);
  }

  selectTile(tile: MjTile) : void {
    // console.log("selectTile", tile, tile.type.toString());
    // checking .active because still can get clicks on the tile while "hiding" animation is playing
    if (tile.active) {
      if (tile.selected) {
        this.audioService.play("unclick", 100);
        tile.unselect();
        this.selectedTile = null;
      } else {
        if (tile.isFree()) {
          tile.select();

          if (this.selectedTile) {
            // console.log("Currently selected: ", this.selectedTile, this.selectedTile.type.toString());
            if (tile.matches(this.selectedTile)) {
              this.undoQueue.push([tile, this.selectedTile]);
              tile.remove();
              this.selectedTile.remove();
              this.visibleTileCount-=2;

              this.selectedTile = null;

              this.onFieldUpdate();
              this.tileCleared.emit();
            } else {
              this.selectedTile.unselect();
              this.selectedTile = tile;
              this.audioService.play("click", 100);
            }
          } else {
            this.selectedTile = tile;
            this.audioService.play("click", 100);
          }
        } else {
          this.shakeField();
          this.audioService.play("wrong", 100);
        }
      }
    }
  }

  private _shakeField:boolean = false;
  private shakeField():void {
    this._shakeField = true;

    window.setTimeout((()=>{
      this._shakeField = false;
    }).bind(this), 50);
  }

  private returnTile(tile: MjTile) {
    if (!tile.active) {
      this.visibleTileCount++;
    };
    tile.returnToField();
  }

  public freePairs: [MjTile, MjTile][] = [];
  public visibleTileCount: number = 0;

  private onFieldUpdate(): void {
    this.gameControlService.updateHintStatus(false);
    this.updateFreePairs();
  }

  private updateFreePairs(): void {
    this.freePairs.length = 0;

    for (let tile of this.tiles) {
      tile.hasFreePair = false;
    }

    for (let i=0; i<this.tiles.length-1; i++) {
      let tile1 = this.tiles[i];
      if (tile1.active && tile1.isFree()) {
        for (let j=i+1; j<this.tiles.length; j++) {
          let tile2 = this.tiles[j];
          if (tile2.active && tile2.isFree() && tile1.matches(tile2)) {
            this.freePairs.push([tile1, tile2]);
            tile1.hasFreePair = true;
            tile2.hasFreePair = true;
          }
        }
      }
    }

    if (this.tiles[this.tiles.length-1].active) {
      this.visibleTileCount++;
    }
  }

  public undo(): boolean {
    let tiles: MjTile[] = this.undoQueue.undo();
    for (let tile of tiles) {
      tile.returnToField();
    }
    this.visibleTileCount+=tiles.length;
    return (this.undoQueue.getUndoStatus());
  }


  public redo(): boolean {
    let tiles: MjTile[] = this.undoQueue.redo();
    for (let tile of tiles) {
      tile.remove();
    }
    this.visibleTileCount-=tiles.length;
    return (this.undoQueue.getRedoStatus());
  }

  // Handle click on to empty area
  public onFieldClick(): void {
    if (this.selectedTile) {
      this.selectedTile.unselect();
      this.selectedTile = null;
    }
  }

  public hasFreePairs(): boolean {
    return this.freePairs.length>0;
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MjTileFieldComponent = void 0;
var core_1 = require("@angular/core");
var mj_tile_1 = require("./classes/mj.tile");
var app_toolbox_1 = require("./classes/app.toolbox");
var mj_game_control_service_1 = require("./services/mj.game.control.service");
var mj_audio_service_1 = require("./services/mj.audio.service");
var mj_undo_queue_1 = require("./classes/mj.undo.queue");
var mj_tile_collection_1 = require("./classes/mj.tile.collection");
var MjTileFieldComponent = /** @class */ (function () {
    function MjTileFieldComponent(_elRef, gameControlService, audioService) {
        var _this = this;
        this._elRef = _elRef;
        this.gameControlService = gameControlService;
        this.audioService = audioService;
        this.subscriptions = [];
        // constants
        // constraints in tile scaling (tile == 2x2 elements), proportion = width / Height
        // 1 is square, 0.5 is 2:1 etc
        this.elementProportionMax = 0.8; // almost square, which is 1
        this.elementProportionMin = 0.7;
        this.tilesReady = false; // local var to let template know that it can draw tiles
        this.ready = new core_1.EventEmitter();
        this.tileCleared = new core_1.EventEmitter();
        this.tiles = [];
        this.selectedTile = null;
        this.fieldDimensionX = 0;
        this.fieldDimensionY = 0;
        this.elementPixelWidth = 0; // pixel width of tile, with "3d" part, margins etc.
        this.elementPixelHeight = 0; // no other margins are added to tiles
        this.showHints = false;
        this.playSounds = false;
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.paddingTop = 0;
        this.paddingBottom = 0;
        this.isVisible = false;
        // TODO wrap into MjTileType class
        // tile type group name / number of tiles in a group / can any tile of the group match another of same group or not
        this.tileSetDescriptor = [
            ["ball", 9, false],
            ["ball", 9, false],
            ["ball", 9, false],
            ["ball", 9, false],
            ["bam", 9, false],
            ["bam", 9, false],
            ["bam", 9, false],
            ["bam", 9, false],
            ["num", 9, false],
            ["num", 9, false],
            ["num", 9, false],
            ["num", 9, false],
            ["season", 4, true],
            ["wind", 4, false],
            ["wind", 4, false],
            ["wind", 4, false],
            ["wind", 4, false],
            ["flower", 4, true],
            ["dragon", 3, false],
            ["dragon", 3, false],
            ["dragon", 3, false],
            ["dragon", 3, false],
        ];
        // layout description only, no other data here. Just an array of tile 2d coordinates
        this.dragonLayout = [
            // layer 0
            [2, 0],
            [4, 0],
            [6, 0],
            [8, 0],
            [10, 0],
            [12, 0],
            [14, 0],
            [16, 0],
            [18, 0],
            [20, 0],
            [22, 0],
            [24, 0],
            [6, 2],
            [8, 2],
            [10, 2],
            [12, 2],
            [14, 2],
            [16, 2],
            [18, 2],
            [20, 2],
            [4, 4],
            [6, 4],
            [8, 4],
            [10, 4],
            [12, 4],
            [14, 4],
            [16, 4],
            [18, 4],
            [20, 4],
            [22, 4],
            [2, 6],
            [4, 6],
            [6, 6],
            [8, 6],
            [10, 6],
            [12, 6],
            [14, 6],
            [16, 6],
            [18, 6],
            [20, 6],
            [22, 6],
            [24, 6],
            [0, 7],
            [26, 7],
            [28, 7],
            [2, 8],
            [4, 8],
            [6, 8],
            [8, 8],
            [10, 8],
            [12, 8],
            [14, 8],
            [16, 8],
            [18, 8],
            [20, 8],
            [22, 8],
            [24, 8],
            [4, 10],
            [6, 10],
            [8, 10],
            [10, 10],
            [12, 10],
            [14, 10],
            [16, 10],
            [18, 10],
            [20, 10],
            [22, 10],
            [6, 12],
            [8, 12],
            [10, 12],
            [12, 12],
            [14, 12],
            [16, 12],
            [18, 12],
            [20, 12],
            [2, 14],
            [4, 14],
            [6, 14],
            [8, 14],
            [10, 14],
            [12, 14],
            [14, 14],
            [16, 14],
            [18, 14],
            [20, 14],
            [22, 14],
            [24, 14],
            // layer 1
            [8, 2],
            [10, 2],
            [12, 2],
            [14, 2],
            [16, 2],
            [18, 2],
            [8, 4],
            [10, 4],
            [12, 4],
            [14, 4],
            [16, 4],
            [18, 4],
            [8, 6],
            [10, 6],
            [12, 6],
            [14, 6],
            [16, 6],
            [18, 6],
            [8, 8],
            [10, 8],
            [12, 8],
            [14, 8],
            [16, 8],
            [18, 8],
            [8, 10],
            [10, 10],
            [12, 10],
            [14, 10],
            [16, 10],
            [18, 10],
            [8, 12],
            [10, 12],
            [12, 12],
            [14, 12],
            [16, 12],
            [18, 12],
            // layer 2
            [10, 4],
            [12, 4],
            [14, 4],
            [16, 4],
            [10, 6],
            [12, 6],
            [14, 6],
            [16, 6],
            [10, 8],
            [12, 8],
            [14, 8],
            [16, 8],
            [10, 10],
            [12, 10],
            [14, 10],
            [16, 10],
            // layer 3
            [12, 6],
            [14, 6],
            [12, 8],
            [14, 8],
            // layer 4
            [13, 7],
        ];
        this.windowWidth = 0;
        this.windowHeight = 0;
        this._shakeField = false;
        this.freePairs = [];
        this.visibleTileCount = 0;
        // every time the window size changes, recalculate field and tile dimensions
        window.addEventListener("resize", (function () {
            _this.retrieveDimensionsFromElement();
        }).bind(this));
        // listen for orientation changes
        window.addEventListener("orientationchange", (function () {
            _this.retrieveDimensionsFromElement();
        }).bind(this));
        // listen to hint requests and show them
        this.subscriptions.push(gameControlService.hintRequestUpdated$.subscribe(function (status) {
            _this.showHints = status;
        }));
        // listen to sound setting
        this.subscriptions.push(gameControlService.soundUpdated$.subscribe(function (status) {
            // update status
            _this.playSounds = status;
        }));
        this.undoQueue = new mj_undo_queue_1.MjUndoQueue();
        this.collection = new mj_tile_collection_1.MjTileCollection();
    }
    Object.defineProperty(MjTileFieldComponent.prototype, "layout", {
        set: function (layout) {
            if (layout === "dragon") {
                this.init(this.dragonLayout);
            }
        },
        enumerable: false,
        configurable: true
    });
    MjTileFieldComponent.prototype.ngOnDestroy = function () {
        // prevent memory leak
        for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
            var subscription = _a[_i];
            subscription.unsubscribe();
        }
    };
    MjTileFieldComponent.prototype.init = function (layout) {
        this.initTiles(layout);
        this.reset();
        // notify that controller is ready
        this.tilesReady = true;
        this.ready.emit();
    };
    MjTileFieldComponent.prototype.show = function () {
        this.isVisible = true;
    };
    MjTileFieldComponent.prototype.hide = function () {
        this.isVisible = false;
    };
    MjTileFieldComponent.prototype.ngOnInit = function () {
        this.retrieveDimensionsFromElement();
    };
    // recalculate field and tile dimensions
    MjTileFieldComponent.prototype.retrieveDimensionsFromElement = function () {
        // let element: any = this._elRef.nativeElement.parentElement;
        // console.log("retrieveDimensionsFromElement");
        // console.log(element);
        // console.log(element.offsetWidth);
        // console.log(element.offsetHeight);
        // Game field
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight * 0.96; // account for the 4% of the top status bar
        // element size
        this.elementPixelWidth = Math.floor(this.windowWidth / this.fieldDimensionX);
        this.elementPixelHeight = Math.floor(this.windowHeight / this.fieldDimensionY);
        // console.log(this.elementPixelWidth);
        // console.log(this.elementPixelHeight);
        // check element proportion and adjust if needed
        var currentProportion = this.elementPixelWidth / this.elementPixelHeight;
        // console.log(currentProportion);
        // too much "Portrait"
        if (currentProportion < this.elementProportionMin) {
            this.elementPixelHeight = Math.floor(this.elementPixelWidth / this.elementProportionMin);
        }
        // too much "Landscape"
        if (currentProportion > this.elementProportionMax) {
            this.elementPixelWidth = Math.floor(this.elementPixelHeight * this.elementProportionMax);
        }
        // field padding, so tiles are centered inside the game field
        var totalPaddingX = this.windowWidth - this.elementPixelWidth * this.fieldDimensionX;
        this.paddingLeft = Math.floor(totalPaddingX / 2) - 5;
        this.paddingRight = totalPaddingX - this.paddingLeft; // accounts for uneven total padding
        // Y - similar
        var totalPaddingY = this.windowHeight - this.elementPixelHeight * this.fieldDimensionY;
        this.paddingTop = Math.floor(totalPaddingY / 2);
        this.paddingBottom = totalPaddingY - this.paddingTop;
        // console.log("elementPixelWidth", this.elementPixelWidth);
        // console.log("elementPixelHeight", this.elementPixelHeight);
        // console.log("paddingTop", this.paddingTop); // Debug output for paddingTop
        // console.log("paddingBottom", this.paddingBottom); // Debug output for paddingBottom
    };
    // arrange tiles into given layout and detect which tile blocks which
    // this function has to be only called once per layout change, and not called on subsequent game restarts
    MjTileFieldComponent.prototype.initTiles = function (collection) {
        this.tiles.length = 0;
        // init tile collection
        for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
            var coordinates = collection_1[_i];
            var newTile = new mj_tile_1.MjTile(coordinates[0], coordinates[1], this.tiles);
            if (this.fieldDimensionX < newTile.x + 1 + newTile.tileSizeX) {
                this.fieldDimensionX = newTile.x + 1 + newTile.tileSizeX;
            }
            if (this.fieldDimensionY < newTile.y + 1 + newTile.tileSizeY) {
                this.fieldDimensionY = newTile.y + 1 + newTile.tileSizeY;
            }
            this.tiles.push(newTile);
        }
        // sort tiles for correct display
        this.tiles.sort(function (tile1, tile2) { return tile1.sortingOrder - tile2.sortingOrder; });
        // set tile types
        this.setTileTypes();
        // determine which tiles block which
        this.buildTileRelationsGraph();
    };
    MjTileFieldComponent.prototype.buildTileRelationsGraph = function () {
        for (var i = 0; i < this.tiles.length - 1; i++) {
            for (var j = i + 1; j < this.tiles.length; j++) {
                // check
                this.tiles[i].checkRelativePositions(this.tiles[j]);
                // and vice versa
                this.tiles[j].checkRelativePositions(this.tiles[i]);
            }
        }
    };
    MjTileFieldComponent.prototype.shuffleTypesFisherYates = function () {
        for (var i = this.tiles.length - 1; i > 0; i--) {
            var j = app_toolbox_1.AppToolbox.random(i + 1);
            //swap
            var tempType = this.tiles[i].type;
            this.tiles[i].type = this.tiles[j].type;
            this.tiles[j].type = tempType;
        }
    };
    MjTileFieldComponent.prototype.setTileTypes = function () {
        var tileIndex = 0;
        for (var _i = 0, _a = this.tileSetDescriptor; _i < _a.length; _i++) {
            var type = _a[_i];
            for (var i = 0; i < type[1]; i++) {
                var tileType = new mj_tile_1.MjTileType(type[0], i, type[2]);
                this.tiles[tileIndex++].setType(tileType);
            }
        }
    };
    MjTileFieldComponent.prototype.reset = function (doShuffle) {
        if (doShuffle === void 0) { doShuffle = true; }
        // reset tiles
        for (var _i = 0, _a = this.tiles; _i < _a.length; _i++) {
            var tile = _a[_i];
            tile.reset();
        }
        if (doShuffle) {
            this.shuffleTypesFisherYates();
        }
        this.onFieldUpdate();
        this.visibleTileCount = this.tiles.length;
        this.undoQueue.reset();
    };
    // This is a debug function used to clear first available free tile pair
    MjTileFieldComponent.prototype.clearTilePair = function () {
        if (this.freePairs.length > 0) {
            var tile1 = this.freePairs[0][0];
            var tile2 = this.freePairs[0][1];
            this.selectTile(tile1);
            this.selectTile(tile2);
        }
    };
    MjTileFieldComponent.prototype.onTileClick = function (tile) {
        this.selectTile(tile);
    };
    MjTileFieldComponent.prototype.selectTile = function (tile) {
        // console.log("selectTile", tile, tile.type.toString());
        // checking .active because still can get clicks on the tile while "hiding" animation is playing
        if (tile.active) {
            if (tile.selected) {
                this.audioService.play("unclick", 100);
                tile.unselect();
                this.selectedTile = null;
            }
            else {
                if (tile.isFree()) {
                    tile.select();
                    if (this.selectedTile) {
                        // console.log("Currently selected: ", this.selectedTile, this.selectedTile.type.toString());
                        if (tile.matches(this.selectedTile)) {
                            this.undoQueue.push([tile, this.selectedTile]);
                            tile.remove();
                            this.selectedTile.remove();
                            this.visibleTileCount -= 2;
                            this.selectedTile = null;
                            this.onFieldUpdate();
                            this.tileCleared.emit();
                        }
                        else {
                            this.selectedTile.unselect();
                            this.selectedTile = tile;
                            this.audioService.play("click", 100);
                        }
                    }
                    else {
                        this.selectedTile = tile;
                        this.audioService.play("click", 100);
                    }
                }
                else {
                    this.shakeField();
                    this.audioService.play("wrong", 100);
                }
            }
        }
    };
    MjTileFieldComponent.prototype.shakeField = function () {
        var _this = this;
        this._shakeField = true;
        window.setTimeout((function () {
            _this._shakeField = false;
        }).bind(this), 50);
    };
    MjTileFieldComponent.prototype.returnTile = function (tile) {
        if (!tile.active) {
            this.visibleTileCount++;
        }
        tile.returnToField();
    };
    MjTileFieldComponent.prototype.onFieldUpdate = function () {
        this.gameControlService.updateHintStatus(false);
        this.updateFreePairs();
    };
    MjTileFieldComponent.prototype.updateFreePairs = function () {
        this.freePairs.length = 0;
        for (var _i = 0, _a = this.tiles; _i < _a.length; _i++) {
            var tile = _a[_i];
            tile.hasFreePair = false;
        }
        for (var i = 0; i < this.tiles.length - 1; i++) {
            var tile1 = this.tiles[i];
            if (tile1.active && tile1.isFree()) {
                for (var j = i + 1; j < this.tiles.length; j++) {
                    var tile2 = this.tiles[j];
                    if (tile2.active && tile2.isFree() && tile1.matches(tile2)) {
                        this.freePairs.push([tile1, tile2]);
                        tile1.hasFreePair = true;
                        tile2.hasFreePair = true;
                    }
                }
            }
        }
        if (this.tiles[this.tiles.length - 1].active) {
            this.visibleTileCount++;
        }
    };
    MjTileFieldComponent.prototype.undo = function () {
        var tiles = this.undoQueue.undo();
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var tile = tiles_1[_i];
            tile.returnToField();
        }
        this.visibleTileCount += tiles.length;
        return this.undoQueue.getUndoStatus();
    };
    MjTileFieldComponent.prototype.redo = function () {
        var tiles = this.undoQueue.redo();
        for (var _i = 0, tiles_2 = tiles; _i < tiles_2.length; _i++) {
            var tile = tiles_2[_i];
            tile.remove();
        }
        this.visibleTileCount -= tiles.length;
        return this.undoQueue.getRedoStatus();
    };
    // Handle click on to empty area
    MjTileFieldComponent.prototype.onFieldClick = function () {
        if (this.selectedTile) {
            this.selectedTile.unselect();
            this.selectedTile = null;
        }
    };
    MjTileFieldComponent.prototype.hasFreePairs = function () {
        return this.freePairs.length > 0;
    };
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], MjTileFieldComponent.prototype, "paused", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], MjTileFieldComponent.prototype, "layout", null);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], MjTileFieldComponent.prototype, "ready", void 0);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], MjTileFieldComponent.prototype, "tileCleared", void 0);
    MjTileFieldComponent = __decorate([
        (0, core_1.Component)({
            selector: "tile-field",
            templateUrl: "templates/mj.tile.field.component.html",
            styleUrls: ["styles/mj.tile.field.component.css"],
        }),
        __metadata("design:paramtypes", [core_1.ElementRef,
            mj_game_control_service_1.MjGameControlService,
            mj_audio_service_1.MjAudioService])
    ], MjTileFieldComponent);
    return MjTileFieldComponent;
}());
exports.MjTileFieldComponent = MjTileFieldComponent;
//# sourceMappingURL=mj.tile.field.component.js.map
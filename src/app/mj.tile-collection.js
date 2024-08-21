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
var core_1 = require('@angular/core');
var mj_tile_1 = require('./mj.tile');
var app_toolbox_1 = require('./app.toolbox');
var MJTileCollection = (function () {
    function MJTileCollection() {
        this.tiles = [];
        this.fieldDimensionX = 0;
        this.fieldDimensionY = 0;
        // tile type group name / number of tiles in a group / can any tile of the group match another of same group or not
        this.tileTypesDescriptor = [
            ["ball", 9, false], ["ball", 9, false], ["ball", 9, false], ["ball", 9, false],
            ["bam", 9, false], ["bam", 9, false], ["bam", 9, false], ["bam", 9, false],
            ["num", 9, false], ["num", 9, false], ["num", 9, false], ["num", 9, false],
            ["season", 4, true],
            ["wind", 4, false], ["wind", 4, false], ["wind", 4, false], ["wind", 4, false],
            ["flower", 4, true],
            ["dragon", 3, false], ["dragon", 3, false], ["dragon", 3, false], ["dragon", 3, false]
        ];
        // layout description only, no other data here. Just an array of tile 2d coordinates
        this.dragonLayout = [
            // layer 0
            [2, 0], [4, 0], [6, 0], [8, 0], [10, 0], [12, 0], [14, 0], [16, 0], [18, 0], [20, 0], [22, 0], [24, 0],
            [6, 2], [8, 2], [10, 2], [12, 2], [14, 2], [16, 2], [18, 2], [20, 2],
            [4, 4], [6, 4], [8, 4], [10, 4], [12, 4], [14, 4], [16, 4], [18, 4], [20, 4], [22, 4],
            [2, 6], [4, 6], [6, 6], [8, 6], [10, 6], [12, 6], [14, 6], [16, 6], [18, 6], [20, 6], [22, 6], [24, 6],
            [0, 7], [26, 7], [28, 7],
            [2, 8], [4, 8], [6, 8], [8, 8], [10, 8], [12, 8], [14, 8], [16, 8], [18, 8], [20, 8], [22, 8], [24, 8],
            [4, 10], [6, 10], [8, 10], [10, 10], [12, 10], [14, 10], [16, 10], [18, 10], [20, 10], [22, 10],
            [6, 12], [8, 12], [10, 12], [12, 12], [14, 12], [16, 12], [18, 12], [20, 12],
            [2, 14], [4, 14], [6, 14], [8, 14], [10, 14], [12, 14], [14, 14], [16, 14], [18, 14], [20, 14], [22, 14], [24, 14],
            // layer 1
            [8, 2], [10, 2], [12, 2], [14, 2], [16, 2], [18, 2],
            [8, 4], [10, 4], [12, 4], [14, 4], [16, 4], [18, 4],
            [8, 6], [10, 6], [12, 6], [14, 6], [16, 6], [18, 6],
            [8, 8], [10, 8], [12, 8], [14, 8], [16, 8], [18, 8],
            [8, 10], [10, 10], [12, 10], [14, 10], [16, 10], [18, 10],
            [8, 12], [10, 12], [12, 12], [14, 12], [16, 12], [18, 12],
            // layer 2
            [10, 4], [12, 4], [14, 4], [16, 4],
            [10, 6], [12, 6], [14, 6], [16, 6],
            [10, 8], [12, 8], [14, 8], [16, 8],
            [10, 10], [12, 10], [14, 10], [16, 10],
            // layer 3
            [12, 6], [14, 6],
            [12, 8], [14, 8],
            // layer 4
            [13, 7]
        ];
        var collection = [];
        if (this.layout == "dragon") {
            collection = this.dragonLayout;
        }
        // init tile collection
        for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
            var coordinates = collection_1[_i];
            var newTile = new mj_tile_1.MjTile(coordinates[0], coordinates[1], this.tiles);
            if (this.fieldDimensionX < newTile.x + newTile.tileSizeX) {
                this.fieldDimensionX = newTile.x + newTile.tileSizeX;
            }
            if (this.fieldDimensionY < newTile.y + newTile.tileSizeY) {
                this.fieldDimensionY = newTile.y + newTile.tileSizeY;
            }
            this.tiles.push(newTile);
        }
    }
    // initialisation might be lengthy, that's why this is a separate function
    // from constructor, with callback on success
    MJTileCollection.prototype.init = function (success) {
        var _this = this;
        // do initialisation asynchronously
        setTimeout(function () {
            // sort tiles for correct display
            _this.tiles
                .sort(function (tile1, tile2) { return tile1.sortingOrder - tile2.sortingOrder; });
            _this.setTypes();
            _this.shuffleTypesFisherYates();
            _this.build(success);
        }, 1);
    };
    MJTileCollection.prototype.build = function (success) {
        for (var i = 0; i < this.tiles.length - 1; i++) {
            for (var j = i + 1; j < this.tiles.length; j++) {
                // check
                this.tiles[i].checkRelativePositions(this.tiles[j]);
                // and vice versa
                this.tiles[j].checkRelativePositions(this.tiles[i]);
            }
        }
        success(this);
    };
    MJTileCollection.prototype.shuffleTypesFisherYates = function () {
        for (var i = this.tiles.length - 1; i > 0; i--) {
            var j = app_toolbox_1.AppToolbox.random(i + 1);
            //swap
            var tempType = this.tiles[i].type;
            this.tiles[i].type = this.tiles[j].type;
            this.tiles[j].type = tempType;
        }
    };
    MJTileCollection.prototype.setTypes = function () {
        var tileIndex = 0;
        for (var _i = 0, _a = this.tileTypesDescriptor; _i < _a.length; _i++) {
            var type = _a[_i];
            for (var i = 0; i < type[1]; i++) {
                var tileType = new mj_tile_1.MjTileType(type[0], i, type[2]);
                this.tiles[tileIndex++].setType(tileType);
            }
        }
    };
    MJTileCollection.prototype.reset = function () {
        for (var _i = 0, _a = this.tiles; _i < _a.length; _i++) {
            var tile = _a[_i];
            tile.reset();
        }
        this.shuffleTypesFisherYates();
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], MJTileCollection.prototype, "layout", void 0);
    MJTileCollection = __decorate([
        core_1.Component({
            selector: 'mj-game',
            templateUrl: 'app/mj.game.component.html',
            styleUrls: ['app/mj.game.component.css']
        }), 
        __metadata('design:paramtypes', [])
    ], MJTileCollection);
    return MJTileCollection;
}());
exports.MJTileCollection = MJTileCollection;
//# sourceMappingURL=mj.tile-collection.js.map
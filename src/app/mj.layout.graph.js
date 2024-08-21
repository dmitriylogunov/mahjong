"use strict";
var mj_tile_1 = require('./mj.tile');
var app_toolbox_1 = require('./app.toolbox');
var MJTilesCollection = (function () {
    function MJTilesCollection(collection) {
        this.tiles = [];
        this.fieldDimensionX = 0;
        this.fieldDimensionY = 0;
        // init tile collection
        for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
            var coordinates = collection_1[_i];
            var newTile = new mj_tile_1.MjTile(coordinates[0], coordinates[1]);
            newTile.z = this.getTileZCoordinate(newTile);
            if (this.fieldDimensionX < newTile.x + newTile.tileSizeX) {
                this.fieldDimensionX = newTile.x + newTile.tileSizeX;
            }
            if (this.fieldDimensionY < newTile.y + newTile.tileSizeY) {
                this.fieldDimensionY = newTile.y + newTile.tileSizeY;
            }
            // sort by Z asc, then by Y asc, then by X desc
            newTile.sortingOrder = newTile.z * 10000 + newTile.y * 100 - newTile.x;
            this.tiles.push(newTile);
        }
    }
    // determine layer (z coordinate) of the tile
    MJTilesCollection.prototype.getTileZCoordinate = function (tile) {
        var z = 0;
        for (var _i = 0, _a = this.tiles; _i < _a.length; _i++) {
            var otherTile = _a[_i];
            if ((z <= otherTile.z) && tile.overlaps2d(otherTile)) {
                z = otherTile.z + 1;
            }
        }
        return z;
    };
    // TODO make async
    MJTilesCollection.prototype.build = function (success) {
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
    MJTilesCollection.prototype.shuffleTypesFisherYates = function () {
        for (var i = this.tiles.length - 1; i > 0; i--) {
            var j = app_toolbox_1.AppToolbox.random(i + 1);
            //swap
            var tempType = this.tiles[i].type;
            this.tiles[i].type = this.tiles[j].type;
            this.tiles[j].type = tempType;
        }
    };
    MJTilesCollection.prototype.setTypes = function (tileTypesDescriptor) {
        var tileIndex = 0;
        for (var _i = 0, tileTypesDescriptor_1 = tileTypesDescriptor; _i < tileTypesDescriptor_1.length; _i++) {
            var type = tileTypesDescriptor_1[_i];
            for (var i = 0; i < type[1]; i++) {
                var tileType = new mj_tile_1.MjTileType(type[0], i, type[2]);
                this.tiles[tileIndex++].setType(tileType);
            }
        }
    };
    MJTilesCollection.prototype.resetTiles = function (tileTypesDescriptor) {
        this.setTypes(tileTypesDescriptor);
        this.shuffleTypesFisherYates();
    };
    return MJTilesCollection;
}());
exports.MJTilesCollection = MJTilesCollection;
//# sourceMappingURL=mj.layout.graph.js.map
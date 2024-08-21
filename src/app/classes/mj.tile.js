"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MjTileType = exports.MjTile = void 0;
var MjTile = /** @class */ (function () {
    function MjTile(x, y, collection) {
        this.type = null;
        this.selected = false;
        this.active = true;
        this.showHint = false;
        this.hasFreePair = false;
        this.tileSizeX = 2;
        this.tileSizeY = 2;
        this.blockedBy = [];
        this.adjacentL = [];
        this.adjacentR = [];
        this.x = x;
        this.y = y;
        this.z = this.getTileZCoordinate(collection);
        // collection will be sorted later: by Z asc, then by Y asc, then by X desc
        this.sortingOrder = this.z * 10000 - this.x * 100 + this.y;
    }
    // determine layer (z coordinate) of the tile
    // there is an assumption that tiles with layer 0 come first in init array,
    // then layer 1 etc
    MjTile.prototype.getTileZCoordinate = function (collection) {
        var z = 0;
        for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
            var otherTile = collection_1[_i];
            if ((z <= otherTile.z) && this.overlaps2d(otherTile)) {
                z = otherTile.z + 1;
            }
        }
        return z;
    };
    MjTile.prototype.setType = function (type) {
        this.type = type;
    };
    // check if two tile overlap, ignoring z coordinate
    MjTile.prototype.overlaps2d = function (otherTile) {
        return ((this.x + this.tileSizeX > otherTile.x && this.x < otherTile.x + otherTile.tileSizeX)
            &&
                (this.y + this.tileSizeY > otherTile.y && this.y < otherTile.y + otherTile.tileSizeY));
    };
    // returns [isOnLeft, isOnRight]
    MjTile.prototype.isXAdjacentTo = function (otherTile) {
        if ((this.z == otherTile.z)
            &&
                (this.y + this.tileSizeY > otherTile.y && this.y < otherTile.y + otherTile.tileSizeY) // same rule as in overlap for Y
        ) {
            return ([
                this.x + this.tileSizeX == otherTile.x, // Adjacent on left
                this.x == otherTile.x + otherTile.tileSizeX // Adjacent on right
            ]);
        }
        else {
            return [false, false];
        }
    };
    MjTile.prototype.checkRelativePositions = function (otherTile) {
        if (this.z == otherTile.z - 1 && this.overlaps2d(otherTile)) {
            this.blockedBy.push(otherTile);
        }
        var adjacency = this.isXAdjacentTo(otherTile);
        if (adjacency[0]) {
            this.adjacentL.push(otherTile);
        }
        else if (adjacency[1]) {
            this.adjacentR.push(otherTile);
        }
    };
    // whether this tile is a match to other tile or not (tile will also match to itself if compared)
    MjTile.prototype.matches = function (otherTile) {
        if (!otherTile) {
            return false;
        }
        else {
            return this.type.matches(otherTile.type);
        }
    };
    MjTile.prototype.isFree = function () {
        for (var _i = 0, _a = this.blockedBy; _i < _a.length; _i++) {
            var tile = _a[_i];
            if (tile.active) {
                return false;
            }
        }
        // adjacent on left
        var freeOnLeft = true;
        for (var _b = 0, _c = this.adjacentL; _b < _c.length; _b++) {
            var tile = _c[_b];
            if (tile.active) {
                freeOnLeft = false;
                break;
            }
        }
        if (freeOnLeft) {
            return true;
        }
        // adjacent on right
        var freeOnRight = true;
        for (var _d = 0, _e = this.adjacentR; _d < _e.length; _d++) {
            var tile = _e[_d];
            if (tile.active) {
                freeOnRight = false;
                break;
            }
        }
        return freeOnRight;
    };
    MjTile.prototype.remove = function () {
        var _this = this;
        this.active = false;
        // TODO play fade out animation
        setTimeout(function () {
            _this.unselect();
        }, 500);
    };
    MjTile.prototype.returnToField = function () {
        this.active = true;
        // TODO play fade in animation
    };
    MjTile.prototype.select = function () {
        this.selected = true;
        // TODO trigger play of "select" animation
    };
    MjTile.prototype.unselect = function () {
        this.selected = false;
        // TODO trigger play of "unselect" animation
    };
    // return to initial state
    MjTile.prototype.reset = function () {
        this.unselect();
        this.active = true;
    };
    MjTile.prototype.startHint = function () {
        this.showHint = true;
    };
    MjTile.prototype.stopHint = function () {
        this.showHint = false;
    };
    return MjTile;
}());
exports.MjTile = MjTile;
var MjTileType = /** @class */ (function () {
    function MjTileType(group, index, matchAny) {
        this.tileCharacters = {
            "ball": [["&#x1F019", "1", "blue"], ["&#x1F01A", "2", "blue"], ["&#x1F01B", "3", "blue"], ["&#x1F01C", "4", "blue"],
                ["&#x1F01D", "5", "blue"], ["&#x1F01E", "6", "blue"], ["&#x1F01F", "7", "blue"], ["&#x1F020", "8", "blue"], ["&#x1F021", "9", "blue"]],
            "bam": [["&#x1F010", "1", "green"], ["&#x1F011", "2", "green"], ["&#x1F012", "3", "green"], ["&#x1F013", "4", "green"],
                ["&#x1F014", "5", "green"], ["&#x1F015", "6", "green"], ["&#x1F016", "7", "green"], ["&#x1F017", "8", "green"], ["&#x1F018", "9", "green"]],
            "num": [["&#x1F007", "1", "red"], ["&#x1F008", "2", "red"], ["&#x1F009", "3", "red"], ["&#x1F00A", "4", "red"],
                ["&#x1F00B", "5", "red"], ["&#x1F00C", "6", "red"], ["&#x1F00D", "7", "red"], ["&#x1F00E", "8", "red"], ["&#x1F00F", "9", "red"]],
            "season": [["&#x1F026", "spring", "green"], ["&#x1F027", "summer", "darkyellow"], ["&#x1F028", "autumn", "orange"], ["&#x1F029", "winter", "blue"]],
            "wind": [["&#x1F000", "east", "black"], ["&#x1F001", "south", "black"], ["&#x1F002", "west", "black"], ["&#x1F003", "north", "black"]],
            "flower": [["&#x1F022", "plum", "pink"], ["&#x1F023", "orchid", "green"], ["&#x1F024", "bamboo", "green"], ["&#x1F025", "mum", "red"]],
            "dragon": [["&#x1F004", "dragon", "red"], ["&#x1F005", "dragon", "green"], ["&#x1F006", "dragon", "blue"]]
        };
        this.group = group;
        this.index = index;
        this.matchAny = matchAny;
    }
    MjTileType.prototype.getPrimaryCharacter = function () {
        return this.tileCharacters[this.group][this.index][0];
    };
    MjTileType.prototype.getSecondaryCharacter = function () {
        return this.tileCharacters[this.group][this.index][1];
    };
    MjTileType.prototype.getColor = function () {
        // console.log(this.group, this.index);
        return this.tileCharacters[this.group][this.index][2];
    };
    MjTileType.prototype.matches = function (otherType) {
        if (this.group === otherType.group && (this.matchAny || this.index == otherType.index)) {
            return true;
        }
        else {
            return false;
        }
    };
    MjTileType.prototype.toString = function () {
        return this.group + this.index.toString();
    };
    return MjTileType;
}());
exports.MjTileType = MjTileType;
//# sourceMappingURL=mj.tile.js.map
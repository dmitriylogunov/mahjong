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
exports.MjTileComponent = void 0;
var core_1 = require("@angular/core");
var mj_tile_1 = require("./classes/mj.tile");
var MjTileComponent = /** @class */ (function () {
    function MjTileComponent() {
        // constants
        this.shiftProportion = 0.14; // how much shift tile face from tile bottom to create pseudo 3d effect
        this.debug = false;
        this._selected = false;
        this.tileClicked = new core_1.EventEmitter();
        // console.log("New tile");
    }
    // TODO this could be outside tile component
    MjTileComponent.prototype.recalculateFontSizes = function () {
        if (!this._elementPixelHeight || !this._elementPixelWidth) {
            return;
        }
        var adjustedElementSize = Math.min(this._elementPixelHeight, this._elementPixelWidth * 1.5 // this is approximate proportion of tile font height to font width
        );
        this.fontSizePrimary = Math.floor(adjustedElementSize * 1.5);
        this.fontSizeSecondary = Math.floor(adjustedElementSize / 3);
        // console.log(adjustedElementSize);
        // Primary tile character horizontal centering
        var primaryCharacterAreaWidth = this._elementPixelWidth * 2 - 10; // -2*margin of tile
        this.primaryWrapperWidth = 4 * this._elementPixelWidth;
        this.primaryWrapperLeftShift = Math.floor((this.primaryWrapperWidth - primaryCharacterAreaWidth) / 2);
    };
    Object.defineProperty(MjTileComponent.prototype, "elementPixelWidth", {
        set: function (elementPixelWidth) {
            this._elementPixelWidth = elementPixelWidth;
            this.shiftX = Math.floor(elementPixelWidth * this.shiftProportion);
            // console.log(this.shiftX);
            this.recalculateFontSizes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MjTileComponent.prototype, "elementPixelHeight", {
        set: function (elementPixelHeight) {
            this._elementPixelHeight = elementPixelHeight;
            this.shiftY = Math.floor(elementPixelHeight * this.shiftProportion);
            // console.log(this.shiftY);
            this.recalculateFontSizes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MjTileComponent.prototype, "selected", {
        set: function (selected) {
            if (!this._selected && selected) {
                // play "select" animation
            }
            else if (this._selected && !selected) {
                // play "unselect"
            }
            this._selected = selected;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MjTileComponent.prototype, "type", {
        set: function (type) {
            this._type = type;
        },
        enumerable: false,
        configurable: true
    });
    MjTileComponent.prototype.onClick = function (event) {
        this.tileClicked.emit();
        event.stopPropagation();
    };
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number)
    ], MjTileComponent.prototype, "x", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number)
    ], MjTileComponent.prototype, "y", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number)
    ], MjTileComponent.prototype, "z", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], MjTileComponent.prototype, "showHints", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], MjTileComponent.prototype, "hasFreePair", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MjTileComponent.prototype, "elementPixelWidth", null);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MjTileComponent.prototype, "elementPixelHeight", null);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], MjTileComponent.prototype, "active", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], MjTileComponent.prototype, "selected", null);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], MjTileComponent.prototype, "isFree", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", mj_tile_1.MjTileType),
        __metadata("design:paramtypes", [mj_tile_1.MjTileType])
    ], MjTileComponent.prototype, "type", null);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], MjTileComponent.prototype, "tileClicked", void 0);
    MjTileComponent = __decorate([
        (0, core_1.Component)({
            selector: "tile",
            templateUrl: "templates/mj.tile.component.html",
            styleUrls: ["styles/mj.tile.component.css"],
        }),
        __metadata("design:paramtypes", [])
    ], MjTileComponent);
    return MjTileComponent;
}());
exports.MjTileComponent = MjTileComponent;
// 'background-image': 'url(/img/tiles/' + _type.group + _type.index + '.png)'
//# sourceMappingURL=mj.tile.component.js.map
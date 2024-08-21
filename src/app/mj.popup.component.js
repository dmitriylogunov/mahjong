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
var MjTileComponent = (function () {
    function MjTileComponent() {
    }
    MjTileComponent = __decorate([
        core_1.Component({
            selector: 'popup',
            template: "\n    <div class=\"popup-window\"></div>\n  ",
            styles: ["\n    .popup-window {\n      width: 50%;\n      min-height: 500px;\n      margin-left: auto;\n      margin-right: auto;\n      margin-top: 50px;\n      color: #FFE1A2;\n      border: 2px solid #FFE1A2;\n      border-radius: 5%;\n      padding: 20px;\n      text-align: center;\n      background-color: #5C5749;\n    }\n  "]
        }), 
        __metadata('design:paramtypes', [])
    ], MjTileComponent);
    return MjTileComponent;
}());
exports.MjTileComponent = MjTileComponent;
//# sourceMappingURL=mj.popup.component.js.map
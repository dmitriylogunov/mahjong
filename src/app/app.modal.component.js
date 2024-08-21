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
exports.ModalAction = exports.ModalComponent = void 0;
var core_1 = require("@angular/core");
// TODO make modal juicy and jumping out with animation
var ModalComponent = /** @class */ (function () {
    function ModalComponent() {
        this.visible = false;
        this.visibleAnimate = false;
    }
    ModalComponent.prototype.show = function () {
        var _this = this;
        this.visible = true;
        setTimeout(function () { return _this.visibleAnimate = true; });
    };
    ModalComponent.prototype.hide = function () {
        var _this = this;
        this.visibleAnimate = false;
        setTimeout(function () { return _this.visible = false; }, 300);
    };
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Array)
    ], ModalComponent.prototype, "actions", void 0);
    ModalComponent = __decorate([
        (0, core_1.Component)({
            selector: 'modal',
            template: "\n  <div (click)=\"hide()\" class=\"modal fade\" tabindex=\"-1\" [ngClass]=\"{'in': visibleAnimate}\"\n       [ngStyle]=\"{'display': visible ? 'block' : 'none', 'opacity': visibleAnimate ? 1 : 0}\">\n    <div class=\"modal-dialog\">\n      <div class=\"modal-content\">\n        <ng-content></ng-content>\n      </div>\n      <div class=\"clear\"></div>\n      <div class=\"modal-actions-wrapper\">\n        <div class=\"modal-actions\">\n          <span *ngFor=\"let action of actions\">\n            <button type=\"button\" class=\"btn\" (click)=action.callback()>{{action.name}}</button>\n          </span>\n        </div>\n      </div>\n      <div style=\"clear: both;\"></div>\n    </div>\n  </div>\n  ",
            styleUrls: ['styles/app.modal.component.css'],
        })
    ], ModalComponent);
    return ModalComponent;
}());
exports.ModalComponent = ModalComponent;
var ModalAction = /** @class */ (function () {
    function ModalAction(name, callback, attributes) {
        if (attributes === void 0) { attributes = {}; }
        this.name = name;
        this.callback = callback;
        this.attributes = attributes;
    }
    return ModalAction;
}());
exports.ModalAction = ModalAction;
//# sourceMappingURL=app.modal.component.js.map
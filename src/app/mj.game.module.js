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
var platform_browser_1 = require('@angular/platform-browser');
var mj_game_component_1 = require('./mj.game.component');
var mj_status_component_1 = require('./mj.status.component');
var mj_options_component_1 = require('./mj.options.component');
var app_modal_component_1 = require('./app.modal.component');
var MjGameModule = (function () {
    function MjGameModule() {
    }
    MjGameModule = __decorate([
        core_1.NgModule({
            imports: [platform_browser_1.BrowserModule],
            declarations: [mj_game_component_1.MjGameComponent, mj_status_component_1.MjStatusComponent, mj_options_component_1.MjOptionsComponent, app_modal_component_1.ModalComponent],
            bootstrap: [mj_game_component_1.MjGameComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], MjGameModule);
    return MjGameModule;
}());
exports.MjGameModule = MjGameModule;
//# sourceMappingURL=mj.game.module.js.map
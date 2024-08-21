"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var mj_game_component_1 = require("./mj.game.component");
var mj_status_component_1 = require("./mj.status.component");
var mj_tile_field_component_1 = require("./mj.tile.field.component");
var mj_tile_component_1 = require("./mj.tile.component");
var app_modal_component_1 = require("./app.modal.component");
var int_as_time_pipe_1 = require("./pipes/int.as.time.pipe");
var intval_pipe_1 = require("./pipes/intval.pipe");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        (0, core_1.NgModule)({
            imports: [platform_browser_1.BrowserModule],
            declarations: [
                mj_game_component_1.MjGameComponent, mj_status_component_1.MjStatusComponent, mj_tile_field_component_1.MJTileFieldComponent, mj_tile_component_1.MjTileComponent, app_modal_component_1.ModalComponent,
                int_as_time_pipe_1.IntAsTimePipe, intval_pipe_1.IntvalPipe
            ],
            bootstrap: [mj_game_component_1.MjGameComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map
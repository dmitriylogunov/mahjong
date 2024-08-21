"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntAsTimePipe = void 0;
var core_1 = require("@angular/core");
var IntAsTimePipe = /** @class */ (function () {
    function IntAsTimePipe() {
    }
    IntAsTimePipe.prototype.transform = function (value) {
        var minutes = Math.floor(value / 60);
        var seconds = value - minutes * 60;
        var secondsStr = seconds.toString();
        if (seconds < 10) {
            secondsStr = "0" + secondsStr;
        }
        return minutes.toString() + ":" + secondsStr;
    };
    IntAsTimePipe = __decorate([
        (0, core_1.Pipe)({
            name: 'intAsTime'
        })
    ], IntAsTimePipe);
    return IntAsTimePipe;
}());
exports.IntAsTimePipe = IntAsTimePipe;
//# sourceMappingURL=int.as.time.pipe.js.map
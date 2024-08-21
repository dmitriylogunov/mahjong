"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppToolbox = void 0;
var AppToolbox = /** @class */ (function () {
    function AppToolbox() {
    }
    // returns random integer in [0..number)
    AppToolbox.random = function (range) {
        return Math.floor(Math.random() * range);
    };
    return AppToolbox;
}());
exports.AppToolbox = AppToolbox;
//# sourceMappingURL=app.toolbox.js.map
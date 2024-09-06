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
exports.MjStatusComponent = void 0;
var core_1 = require("@angular/core");
var mj_game_control_service_1 = require("./services/mj.game.control.service");
var mj_audio_service_1 = require("./services/mj.audio.service");
var MjStatusComponent = /** @class */ (function () {
    function MjStatusComponent(gameControlService, audioService) {
        var _this = this;
        this.gameControlService = gameControlService;
        this.audioService = audioService;
        this.subscriptions = [];
        this.isVisible = true;
        this.undoStatus = false;
        this.redoStatus = false;
        this.hintCurrentlyShowing = false;
        this.hints = [];
        this.undo = new core_1.EventEmitter();
        this.redo = new core_1.EventEmitter();
        this.restart = new core_1.EventEmitter();
        this.hintStatus = false;
        // subscribe to events
        this.subscriptions.push(gameControlService.undoStatusUpdated$.subscribe(function (status) {
            _this.undoStatus = status;
            // console.log("undostatus",status);
        }));
        this.subscriptions.push(gameControlService.redoStatusUpdated$.subscribe(function (status) {
            _this.redoStatus = status;
            // console.log("redostatus",status);
        }));
        this.subscriptions.push(gameControlService.hintRequestUpdated$.subscribe(function (status) {
            if (status) {
                _this.audioService.play("boom", 100);
                _this.hintCurrentlyShowing = true;
            }
            else {
                _this.audioService.play("blip", 100);
                window.setTimeout((function () {
                    _this.hintCurrentlyShowing = false;
                }).bind(_this), 250);
            }
        }));
        this.subscriptions.push(gameControlService.soundUpdated$.subscribe(function (status) {
            _this.soundStatus = status;
        }));
        this.reset();
    }
    MjStatusComponent.prototype.ngOnDestroy = function () {
        // prevent memory leak
        for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
            var subscription = _a[_i];
            subscription.unsubscribe();
        }
    };
    MjStatusComponent.prototype.ngOnInit = function () { };
    MjStatusComponent.prototype.show = function () {
        this.isVisible = true;
    };
    MjStatusComponent.prototype.hide = function () {
        this.isVisible = false;
    };
    MjStatusComponent.prototype.reset = function () {
        this.hintsRemaining = this.hints.length;
        this.gameControlService.updateHintStatus(false);
        this.undoStatus = false;
        this.redoStatus = false;
        this.paused = false;
    };
    Object.defineProperty(MjStatusComponent.prototype, "hintsCount", {
        set: function (hintsCount) {
            this.hints = Array(hintsCount).fill(true);
            this.hintsRemaining = hintsCount - 1; // -1 for debug
        },
        enumerable: false,
        configurable: true
    });
    MjStatusComponent.prototype.onHintClick = function () {
        if (!this.hintCurrentlyShowing) {
            if (this.hintsRemaining > 0) {
                // this.hintsRemaining--;
                this.hints[this.hintsRemaining] = false;
                // inform other components that hint is requested
                this.hintCurrentlyShowing = true; //seems like duplication but it is not. it overcomes possible concurrency issues.
                this.gameControlService.updateHintStatus(true);
            }
        }
        else {
            this.hintCurrentlyShowing = false;
            this.gameControlService.updateHintStatus(false);
        }
    };
    MjStatusComponent.prototype.onUndoClick = function () {
        if (this.undoStatus) {
            this.undo.emit(null);
        }
        else {
            this.audioService.play("wrong", 100);
        }
    };
    MjStatusComponent.prototype.onRedoClick = function () {
        if (this.redoStatus) {
            this.redo.emit(null);
        }
        else {
            this.audioService.play("wrong", 100);
        }
    };
    MjStatusComponent.prototype.onSoundClick = function () {
        this.soundStatus = !this.soundStatus;
        this.gameControlService.updateSoundStatus(this.soundStatus);
    };
    MjStatusComponent.prototype.onPauseClick = function () {
        this.paused = !this.paused;
        this.gameControlService.pause(this.paused);
    };
    MjStatusComponent.prototype.onStepClick = function () {
        this.gameControlService.debug("step");
    };
    MjStatusComponent.prototype.onSolveClick = function () {
        this.gameControlService.debug("solve");
    };
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number)
    ], MjStatusComponent.prototype, "score", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number)
    ], MjStatusComponent.prototype, "timer", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], MjStatusComponent.prototype, "showDebugFields", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MjStatusComponent.prototype, "hintsCount", null);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], MjStatusComponent.prototype, "undo", void 0);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], MjStatusComponent.prototype, "redo", void 0);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], MjStatusComponent.prototype, "restart", void 0);
    MjStatusComponent = __decorate([
        (0, core_1.Component)({
            selector: "status",
            templateUrl: "templates/mj.status.component.html",
            styleUrls: ["styles/mj.status.component.css"],
        }),
        __metadata("design:paramtypes", [mj_game_control_service_1.MjGameControlService,
            mj_audio_service_1.MjAudioService])
    ], MjStatusComponent);
    return MjStatusComponent;
}());
exports.MjStatusComponent = MjStatusComponent;
//# sourceMappingURL=mj.status.component.js.map
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
var Subject_1 = require('rxjs/Subject');
var MjGameControlService = (function () {
    function MjGameControlService() {
        // Observable sources
        this.undoStatus = new Subject_1.Subject();
        this.redoStatus = new Subject_1.Subject();
        this.hintRequestStatus = new Subject_1.Subject();
        this.soundStatus = new Subject_1.Subject();
        this.musicStatus = new Subject_1.Subject();
        this.score = new Subject_1.Subject();
        this.paused = new Subject_1.Subject();
        this.debugCommand = new Subject_1.Subject();
        // Observable streams
        this.undoStatusUpdated$ = this.undoStatus.asObservable();
        this.redoStatusUpdated$ = this.redoStatus.asObservable();
        this.hintRequestUpdated$ = this.hintRequestStatus.asObservable();
        this.soundUpdated$ = this.soundStatus.asObservable();
        this.musicUpdated$ = this.musicStatus.asObservable();
        this.scoreUpdated$ = this.score.asObservable();
        this.paused$ = this.paused.asObservable();
        this.debugCommand$ = this.debugCommand.asObservable();
    }
    // Service commands
    MjGameControlService.prototype.updateUndoStatus = function (status) {
        this.undoStatus.next(status);
    };
    MjGameControlService.prototype.updateRedoStatus = function (status) {
        this.redoStatus.next(status);
    };
    MjGameControlService.prototype.updateHintStatus = function (status) {
        this.hintRequestStatus.next(status);
    };
    MjGameControlService.prototype.updateSoundStatus = function (status) {
        this.soundStatus.next(status);
    };
    MjGameControlService.prototype.updateMusicStatus = function (status) {
        this.soundStatus.next(status);
    };
    MjGameControlService.prototype.addScore = function (diff) {
        this.score.next(diff);
    };
    MjGameControlService.prototype.pause = function (paused) {
        this.paused.next(paused);
    };
    MjGameControlService.prototype.debug = function (command) {
        this.debugCommand.next(command);
    };
    MjGameControlService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MjGameControlService);
    return MjGameControlService;
}());
exports.MjGameControlService = MjGameControlService;
//# sourceMappingURL=mj.game.control.service.js.map
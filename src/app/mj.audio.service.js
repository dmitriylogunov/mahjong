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
var app_toolbox_1 = require('./app.toolbox');
var mj_game_control_service_1 = require('./mj.game.control.service');
var createjs = require('@createjs');

var Subject_1 = require('rxjs').Subject;
var MjAudioService = (function () {
    function MjAudioService(gameControlService) {
        var _this = this;
        this.gameControlService = gameControlService;
        this.soundsReady = new Subject_1.Subject();
        // Observable streams
        this.soundsReady$ = this.soundsReady.asObservable();
        this.subscriptions = [];
        this.soundStatus = false;
        this.musicStatus = false;
        this.soundData = {};
        this.loadedSounds = {};
        // listen to sound status change
        this.subscriptions.push(gameControlService.soundUpdated$.subscribe(function (status) {
            _this.soundStatus = status;
        }));
        // listen to music status change
        this.subscriptions.push(gameControlService.musicUpdated$.subscribe(function (status) {
            _this.musicStatus = status;
        }));
    }
    MjAudioService.prototype.ngOnDestroy = function () {
        // prevent memory leak
        for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
            var subscription = _a[_i];
            subscription.unsubscribe();
        }
    };
    MjAudioService.prototype.load = function (soundConfiguration) {
        // init
        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.on("fileload", this.handleLoadComplete.bind(this));
        this.soundCount = 0;
        for (var soundGroupId in soundConfiguration) {
            this.soundData[soundGroupId] = soundConfiguration[soundGroupId].length;
            this.soundCount += this.soundData[soundGroupId];
        }
        // load
        this.loadedSoundsCount = 0;
        for (var soundGroupId in soundConfiguration) {
            for (var soundIndex = 0; soundIndex < soundConfiguration[soundGroupId].length; soundIndex++) {
                createjs.Sound.registerSound({
                    src: soundConfiguration[soundGroupId][soundIndex],
                    id: soundGroupId + soundIndex.toString()
                });
            }
        }
    };
    MjAudioService.prototype.handleLoadComplete = function (a) {
        this.loadedSounds[a.id] = true;
        this.loadedSoundsCount++;
        if (this.loadedSoundsCount == this.soundCount) {
            this.triggerSoundsReady();
        }
    };
    MjAudioService.prototype.play = function (soundGroupId, delay, repeat) {
        if (delay === void 0) { delay = null; }
        if (repeat === void 0) { repeat = false; }
        // sounds are off
        if (!this.soundStatus) {
            return;
        }
        // otherwise, play
        var count = this.soundData[soundGroupId];
        var soundIndex = app_toolbox_1.AppToolbox.random(count);
        try {
            if (delay) {
                window.setTimeout((function () {
                    createjs.Sound.play(soundGroupId + soundIndex.toString());
                }).bind(this), delay);
            }
            else {
                createjs.Sound.play(soundGroupId + soundIndex.toString());
            }
        }
        catch (err) {
        }
    };
    MjAudioService.prototype.triggerSoundsReady = function () {
        this.soundsReady.next(true);
    };
    // load and play audio file
    MjAudioService.prototype.playFile = function (location) {
        // TODO implement
    };
    MjAudioService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [(typeof (_a = typeof mj_game_control_service_1.MjGameControlService !== 'undefined' && mj_game_control_service_1.MjGameControlService) === 'function' && _a) || Object])
    ], MjAudioService);
    return MjAudioService;
    var _a;
}());
exports.MjAudioService = MjAudioService;
//# sourceMappingURL=mj.audio.service.js.map
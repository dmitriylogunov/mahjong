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
exports.MjGameComponent = void 0;
var core_1 = require("@angular/core");
var mj_status_component_1 = require("./mj.status.component");
var mj_tile_field_component_1 = require("./mj.tile.field.component");
var mj_game_control_service_1 = require("./services/mj.game.control.service");
var mj_audio_service_1 = require("./services/mj.audio.service");
var app_modal_component_1 = require("./app.modal.component");
var MjGameComponent = /** @class */ (function () {
    function MjGameComponent(gameControlService, audioService) {
        var _this = this;
        this.gameControlService = gameControlService;
        this.audioService = audioService;
        //config
        this.numberOfHints = 1;
        this.soundConfiguration = {
            coin: ["sounds/coin1.wav", "sounds/coin2.wav", "sounds/coin3.wav"],
            blip: ["sounds/blip.wav"],
            undo: ["sounds/back.wav"],
            bonus: ["sounds/bonus.wav"],
            boom: ["sounds/boom.wav"],
            wrong: ["sounds/wrong.wav"],
            lose: ["sounds/lose.wav"],
            win: ["sounds/win.wav"],
            click: ["sounds/click1.wav"], //, "sounds/click2.wav"
            unclick: ["sounds/click-reverse.wav"],
            question: ["sounds/question.wav"],
        };
        this.subscriptions = [];
        this.currentLayout = null;
        this.mainMenuModalActions = [
            new app_modal_component_1.ModalAction("Start", (function () {
                _this.onStartGameClick();
            }).bind(this)),
        ];
        this.restartGameModalActions = [
            new app_modal_component_1.ModalAction("Yes", (function () {
                _this.onRestartYesClick();
            }).bind(this)),
            // new ModalAction("No", (()=>{}))
        ];
        this.tieModalActions = [
            // new ModalAction("Continue", (()=>{})), // do nothing
            new app_modal_component_1.ModalAction("Restart", (function () {
                _this.onTieRestartClick();
            }).bind(this)),
            new app_modal_component_1.ModalAction("New game", (function () {
                _this.onRestartYesClick();
            }).bind(this)),
        ];
        this.winModalActions = [
            new app_modal_component_1.ModalAction("Play Again", (function () {
                _this.onRestartYesClick();
            }).bind(this)),
        ];
        // Global game event subscriptions
        this.subscriptions.push(audioService.soundsReady$.subscribe(function (dummyVariable) {
            _this.playMusic();
        }));
        this.subscriptions.push(gameControlService.paused$.subscribe(function (pauseStatus) {
            _this.paused = pauseStatus;
        }));
        this.subscriptions.push(gameControlService.debugCommand$.subscribe(function (command) {
            _this.onDebugCommand(command);
        }));
        window.setInterval((function () {
            if (!_this.paused) {
                _this.timer += 1;
                _this.score -= 0.1;
            }
        }).bind(this), 1000);
    }
    MjGameComponent.prototype.ngOnDestroy = function () {
        // prevent memory leak
        for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
            var subscription = _a[_i];
            subscription.unsubscribe();
        }
    };
    MjGameComponent.prototype.ngOnInit = function () {
        this.state = "intro";
        this.audioService.load(this.soundConfiguration);
        // TODO - read from browser config
        this.gameControlService.updateSoundStatus(true);
        // load layout
        // TODO show "loading"
        // console.log("loading started");
        this.currentLayout = "dragon"; // update of layout will trigger initialisation of layout controller and tile field
        // initialisation sequence continued in ngAfterViewInit
    };
    MjGameComponent.prototype.ngAfterViewInit = function () {
        var arModals = this.modals.toArray();
        this.mainMenuModal = arModals[0];
        this.restartModal = arModals[1];
        this.tieModal = arModals[2];
        this.winModal = arModals[3];
        // show main menu
        this.mainMenuModal.show();
    };
    MjGameComponent.prototype.onTileCollectionReady = function () {
        // TODO hide "loading"
        // console.log("loading finished");
    };
    MjGameComponent.prototype.checkGameStatus = function () {
        if (!this.tileField.hasFreePairs()) {
            if (this.tileField.visibleTileCount == 0) {
                // win
                this.audioService.play("win", 100);
                this.state = "win";
                this.status.hide();
                this.tileField.hide();
                this.winModal.show();
            }
            else {
                // lose
                this.audioService.play("lose", 100);
                this.tieModal.show();
            }
        }
    };
    MjGameComponent.prototype.onTileCleared = function () {
        this.gameControlService.updateUndoStatus(true);
        this.gameControlService.updateRedoStatus(false);
        this.score += 10;
        this.audioService.play("coin", 100);
        this.checkGameStatus();
    };
    MjGameComponent.prototype.onUndo = function () {
        var undoStatus = this.tileField.undo();
        this.gameControlService.updateUndoStatus(undoStatus);
        this.gameControlService.updateRedoStatus(true);
        this.audioService.play("undo", 100);
        if (this.score > 0) {
            this.score -= 10;
        }
    };
    MjGameComponent.prototype.onRedo = function () {
        var redoStatus = this.tileField.redo();
        this.gameControlService.updateUndoStatus(true);
        this.gameControlService.updateRedoStatus(redoStatus);
        this.checkGameStatus();
        this.score += 10;
    };
    MjGameComponent.prototype.onClearPair = function () {
        this.tileField.clearTilePair();
    };
    MjGameComponent.prototype.onRestartRequest = function () {
        this.restartModal.show();
    };
    MjGameComponent.prototype.startGame = function () {
        this.state = "game";
        this.initGameValues();
        this.status.reset();
        this.status.show();
        this.tileField.show();
    };
    MjGameComponent.prototype.onStartGameClick = function () {
        this.startGame();
    };
    MjGameComponent.prototype.onRestartYesClick = function () {
        this.tileField.reset();
        this.startGame();
    };
    MjGameComponent.prototype.onTieRestartClick = function () {
        this.tileField.reset(false);
        this.startGame();
    };
    MjGameComponent.prototype.initGameValues = function () {
        this.score = 0;
        this.timer = 0;
        this.paused = false;
        this.gameControlService.pause(false);
    };
    MjGameComponent.prototype.onClick = function () {
        // stop hint animation
        this.gameControlService.updateHintStatus(false);
    };
    MjGameComponent.prototype.playMusic = function () {
        // this.audioService.playFile("music/");
    };
    MjGameComponent.prototype.stopMusic = function () { };
    MjGameComponent.prototype.onDebugCommand = function (command) {
        if (command == "step") {
            this.tileField.clearTilePair();
        }
        if (command == "solve") {
            while (this.tileField.hasFreePairs()) {
                this.tileField.clearTilePair();
            }
        }
    };
    __decorate([
        (0, core_1.ViewChild)(mj_tile_field_component_1.MjTileFieldComponent),
        __metadata("design:type", mj_tile_field_component_1.MjTileFieldComponent)
    ], MjGameComponent.prototype, "tileField", void 0);
    __decorate([
        (0, core_1.ViewChild)(mj_status_component_1.MjStatusComponent),
        __metadata("design:type", mj_status_component_1.MjStatusComponent)
    ], MjGameComponent.prototype, "status", void 0);
    __decorate([
        (0, core_1.ViewChildren)(app_modal_component_1.ModalComponent),
        __metadata("design:type", core_1.QueryList)
    ], MjGameComponent.prototype, "modals", void 0);
    MjGameComponent = __decorate([
        (0, core_1.Component)({
            selector: "mj-game",
            templateUrl: "templates/mj.game.component.html",
            styleUrls: ["styles/mj.game.component.css"],
            providers: [mj_game_control_service_1.MjGameControlService, mj_audio_service_1.MjAudioService],
        }),
        __metadata("design:paramtypes", [mj_game_control_service_1.MjGameControlService,
            mj_audio_service_1.MjAudioService])
    ], MjGameComponent);
    return MjGameComponent;
}());
exports.MjGameComponent = MjGameComponent;
//# sourceMappingURL=mj.game.component.js.map
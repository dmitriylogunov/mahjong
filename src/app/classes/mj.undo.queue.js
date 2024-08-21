"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MjUndoQueue = void 0;
var MjUndoQueue = /** @class */ (function () {
    function MjUndoQueue() {
        this.tileRemoveLog = [];
        this.tileRemoveLogCursor = 0;
    }
    MjUndoQueue.prototype.reset = function () {
        this.tileRemoveLog.length = 0;
    };
    MjUndoQueue.prototype.push = function (tiles) {
        // clear tail of the queue, if undo was done
        if (this.tileRemoveLog.length > this.tileRemoveLogCursor) {
            this.tileRemoveLog.splice(this.tileRemoveLogCursor, this.tileRemoveLog.length - this.tileRemoveLogCursor);
        }
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var tile = tiles_1[_i];
            this.tileRemoveLog.push(tile);
        }
        this.tileRemoveLogCursor += tiles.length;
    };
    MjUndoQueue.prototype.undo = function () {
        if (!this.getUndoStatus()) {
            return null;
        }
        var tiles = [this.tileRemoveLog[this.tileRemoveLogCursor - 1], this.tileRemoveLog[this.tileRemoveLogCursor - 2]];
        this.tileRemoveLogCursor -= 2;
        return tiles;
    };
    MjUndoQueue.prototype.getUndoStatus = function () {
        return this.tileRemoveLogCursor > 0;
    };
    MjUndoQueue.prototype.redo = function () {
        if (!this.getRedoStatus()) {
            return null;
        }
        var tiles = [this.tileRemoveLog[this.tileRemoveLogCursor], this.tileRemoveLog[this.tileRemoveLogCursor + 1]];
        this.tileRemoveLogCursor += 2;
        return tiles;
    };
    MjUndoQueue.prototype.getRedoStatus = function () {
        return this.tileRemoveLogCursor < this.tileRemoveLog.length - 1;
    };
    return MjUndoQueue;
}());
exports.MjUndoQueue = MjUndoQueue;
//# sourceMappingURL=mj.undo.queue.js.map
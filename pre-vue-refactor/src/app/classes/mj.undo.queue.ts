import { MjTile } from './mj.tile';

export class MjUndoQueue {
  constructor() {
  }

  private tileRemoveLog: MjTile[] = [];
  private tileRemoveLogCursor = 0;

  public reset(): void {
    this.tileRemoveLog.length = 0;
  }

  public push(tiles: MjTile[]) {
    // clear tail of the queue, if undo was done
    if (this.tileRemoveLog.length>this.tileRemoveLogCursor) {
      this.tileRemoveLog.splice(this.tileRemoveLogCursor, this.tileRemoveLog.length-this.tileRemoveLogCursor);
    }
    for (let tile of tiles) {
      this.tileRemoveLog.push(tile);
    }
    this.tileRemoveLogCursor+=tiles.length;
  }

  public undo(): MjTile[] {
    if (!this.getUndoStatus()) {
      return null;
    }
    let tiles: MjTile[] = [this.tileRemoveLog[this.tileRemoveLogCursor-1], this.tileRemoveLog[this.tileRemoveLogCursor-2]];
    this.tileRemoveLogCursor-=2;

    return tiles;
  }

  public getUndoStatus(): boolean {
    return this.tileRemoveLogCursor>0;
  }

  public redo(): MjTile[] {
    if (!this.getRedoStatus()) {
      return null;
    }

    let tiles: MjTile[] = [this.tileRemoveLog[this.tileRemoveLogCursor], this.tileRemoveLog[this.tileRemoveLogCursor+1]];
    this.tileRemoveLogCursor+=2;

    return tiles;
  }

  public getRedoStatus(): boolean {
    return this.tileRemoveLogCursor<this.tileRemoveLog.length-1;
  }
}

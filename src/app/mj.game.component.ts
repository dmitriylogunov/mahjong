import { Component, ViewChild } from '@angular/core';
import { MjStatusComponent }  from './mj.status.component';
import { MJTileCollectionComponent } from './mj.tile-collection.component';
import { MjGameControlService } from './mj.game.control.service';
import { MjAudioService } from './mj.audio.service';

@Component({
  selector: 'mj-game',
  template: `
    <style>
      .statusfield
      {
        position: relative;
        width: 100vw;
      }
      .gamefield {
        position: relative;
        width: 100vw;
        height: 80vh;
        padding: 10px;
        background-color: lightyellow;
      }
    </style>

    <div class="statusfield"><status
      (undo)=onUndoRequest()
      (redo)=onRedoRequest()
      (restart)=onRestartRequest()
      [hintsCount]=3
      [paused]=false
      [score]=score
    ></status></div>

    <div class="gamefield noselect"><tile-collection
      [layout]=currentLayout
      (ready)=onTileCollectionReady()
      (tileNumberChange)=onTileNumberChange($event)
      (click)=onClick()
      [paused]=false
      ></tile-collection></div>

    <options></options>
  `,
  providers: [MjGameControlService, MjAudioService]
})
export class MjGameComponent {
  constructor(private gameControlService: MjGameControlService, private audioService: MjAudioService) {
  }

  @ViewChild(MJTileCollectionComponent)
  private tileCollection: MJTileCollectionComponent;

  @ViewChild(MjStatusComponent)
  private status: MjStatusComponent;

  public currentLayout: string = null;

  ngOnInit(): void {
    this.audioService.load();
    this.gameControlService.updateSoundStatus(true);

    // load layout
    console.log("loading started");     // TODO show "loading"
    this.currentLayout = "dragon";
  }

  onTileCollectionReady():void {
    console.log("loading finished"); // TODO hide "loading"
  }

  onTileNumberChange(diff: number): void {
    let status = this.getGameEndStatus();
    if (status==="win") {
      this.audioService.play("win", 100);
    } else if (status==="lose") {
      this.audioService.play("lose", 100);
    } else {
      if (diff<0) {
        this.audioService.play("coin", 100);
      } else if (diff>0) {
        this.audioService.play("undo", 100);
      }
    }
  }

  private getGameEndStatus(): string {
    if (this.tileCollection.activeTileCount==0) {
      return "win";
    }
    if (this.tileCollection.freePairs.length==0) {
      return "lose";
    }
  }

  public onUndoRequest() {
    this.tileCollection.undo();
  }

  public onRedoRequest() {
    this.tileCollection.redo();
  }

  public onRestartRequest() {
    this.tileCollection.reset();
    this.status.reset();
  }

  private onClick() {
    // stop hint animation
    this.gameControlService.updateHintStatus(false);
  }

  private score: number = 0;
}

import { Injectable } from '@angular/core';
import { AppToolbox } from './app.toolbox';

interface SoundConfiguration {
  [id: string]: string[];
}

declare var createjs: any;

@Injectable()
export class MjAudioService {
  private soundConfiguration: SoundConfiguration = {
    "coin": ["sounds/coin1.wav", "sounds/coin2.wav"],
    "blip": ["sounds/blip.wav"],
    "wrong": ["sounds/wrong.wav"]
  };

  constructor() {
    // createjs.Sound.on("fileload", this.handleLoadComplete);
    // createjs.Sound.alternateExtensions = ["mp3"];
  }


  private soundIds: string[]; // array of createjs.Sound objects

  public load(): void {
    for (let soundGroupId in this.soundConfiguration) {
      for (let soundIndex=0;soundIndex<this.soundConfiguration[soundGroupId].length;soundIndex++) {
        createjs.Sound.registerSound(
          {
            src: this.soundConfiguration[soundGroupId][soundIndex],
            id: soundGroupId + soundIndex.toString()
          }
        );
      }
    }
  }

  public play(soundGroupId: string): void {
    let count = this.soundConfiguration[soundGroupId].length;
    let soundIndex = AppToolbox.random(count);

    try {
      createjs.Sound.play(soundGroupId + soundIndex.toString());
    } catch (err) {
      // ignore errors
    }
  }
}

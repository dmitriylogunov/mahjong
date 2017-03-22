import { Injectable } from '@angular/core';
import { AppToolbox } from './app.toolbox';

interface SoundConfiguration {
  [id: string]: string[];
}

declare var createjs: any;

@Injectable()
export class MjAudioService {
  private soundConfiguration: SoundConfiguration = {
    "coin": ["sounds/coin1.wav", "sounds/coin2.wav", "sounds/coin3.wav"],
    "blip": ["sounds/blip.wav"],
    "undo": ["sounds/back.wav"],
    "bonus": ["sounds/bonus.wav"],
    "boom": ["sounds/boom.wav"],
    "wrong": ["sounds/wrong.wav"],
    "lose": ["sounds/lose.wav"],
    "win": ["sounds/win.wav"],
    "click": ["sounds/click1.wav"], //, "sounds/click2.wav"
    "unclick": ["sounds/click-reverse.wav"],
    "question": ["sounds/question.wav"]
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

  public play(soundGroupId: string, delay: number = null, repeat: boolean = false): void {
    let count = this.soundConfiguration[soundGroupId].length;
    let soundIndex = AppToolbox.random(count);

    try {
      if (delay) {
        window.setTimeout((()=>{
          createjs.Sound.play(soundGroupId + soundIndex.toString());
        }).bind(this), delay);
      } else {
        createjs.Sound.play(soundGroupId + soundIndex.toString());
      }
    } catch (err) {
      // ignore errors
    }
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { AppToolbox } from './app.toolbox';
import { Subscription }   from 'rxjs/Subscription';
import { MjGameControlService } from './mj.game.control.service';
import { Subject }    from 'rxjs/Subject';

interface SoundConfiguration {
  [id: string]: string[];
}

declare var createjs: any;

@Injectable()
export class MjAudioService implements OnDestroy {
  private soundsReady = new Subject<boolean>();

  // Observable streams
  soundsReady$ = this.soundsReady.asObservable();

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

  private subscriptions: Subscription[] = [];
  private soundStatus: boolean = false;
  private musicStatus: boolean = false;

  constructor(private gameControlService: MjGameControlService) {
    // listen to sound status change
    this.subscriptions.push(gameControlService.soundUpdated$.subscribe(
      status => {
        this.soundStatus = status;
      }
    ));

    // listen to music status change
    this.subscriptions.push(gameControlService.musicUpdated$.subscribe(
      status => {
        this.musicStatus = status;
      }
    ));
  }

  ngOnDestroy(): void {
    // prevent memory leak
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  private soundCount: number;

  public load(): void {
    // init
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.on("fileload", this.handleLoadComplete.bind(this));
    this.soundCount = 0;
    for (let soundGroupId in this.soundConfiguration) {
      this.soundCount+=this.soundConfiguration[soundGroupId].length;
    }

    // load
    this.loadedSoundsCount = 0
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

  private loadedSounds: any = {};
  private loadedSoundsCount: number;
  private handleLoadComplete(a: any) {
    this.loadedSounds[a.id] = true;
    this.loadedSoundsCount++;
    if (this.loadedSoundsCount == this.soundCount) {
      this.triggerSoundsReady();
    }
  }

  public play(soundGroupId: string, delay: number = null, repeat: boolean = false): void {
    // sounds are off
    if (!this.soundStatus) {
      return;
    }

    // otherwise, play
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

  triggerSoundsReady() {
    this.soundsReady.next(true);
  }

}

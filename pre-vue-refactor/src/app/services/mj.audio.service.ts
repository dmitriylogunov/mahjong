import { Injectable, OnDestroy } from '@angular/core';
import { AppToolbox } from './../classes/app.toolbox';
import { Subscription }   from 'rxjs/Subscription';
import { MjGameControlService } from './mj.game.control.service';
import { Subject }    from 'rxjs/Subject';

export interface SoundConfiguration {
  [id: string]: string[];
}

interface SoundData {
  [id: string]: number; // for the moment, just keep number of sounds in a group
}

declare var createjs: any;

@Injectable()
export class MjAudioService implements OnDestroy {
  private soundsReady = new Subject<boolean>();

  // Observable streams
  soundsReady$ = this.soundsReady.asObservable();

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
  private soundData: SoundData = {};

  public load(soundConfiguration: SoundConfiguration): void {
    // init
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.on("fileload", this.handleLoadComplete.bind(this));
    this.soundCount = 0;
    for (let soundGroupId in soundConfiguration) {
      this.soundData[soundGroupId] = soundConfiguration[soundGroupId].length;
      this.soundCount+=this.soundData[soundGroupId];
    }

    // load
    this.loadedSoundsCount = 0
    for (let soundGroupId in soundConfiguration) {
      for (let soundIndex=0;soundIndex<soundConfiguration[soundGroupId].length;soundIndex++) {
        createjs.Sound.registerSound(
          {
            src: soundConfiguration[soundGroupId][soundIndex],
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
    let count = this.soundData[soundGroupId];
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

  // load and play audio file
  public playFile(location: string) {
    // TODO implement
  }

}

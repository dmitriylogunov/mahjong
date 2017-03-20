import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class MjGameControlService {
  // Observable sources
  private undoStatus = new Subject<boolean>();
  private redoStatus = new Subject<boolean>();
  private hintRequestStatus = new Subject<boolean>();
  private soundStatus = new Subject<boolean>();

  // Observable streams
  undoStatusUpdated$ = this.undoStatus.asObservable();
  redoStatusUpdated$ = this.redoStatus.asObservable();
  hintRequestUpdated$ = this.hintRequestStatus.asObservable();
  soundUpdated$ = this.soundStatus.asObservable();

  // Service commands
  updateUndoStatus(status: boolean) {
    this.undoStatus.next(status);
  }

  updateRedoStatus(status: boolean) {
    this.redoStatus.next(status);
  }

  updateHintStatus(status: boolean) {
    this.hintRequestStatus.next(status);
  }

  updateSoundStatus(status: boolean) {
    this.soundStatus.next(status);
  }
}

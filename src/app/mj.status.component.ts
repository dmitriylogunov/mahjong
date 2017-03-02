import { Component } from '@angular/core';

@Component({
  selector: 'status',
  template: `
    <div class="status">
      <span class="hints">
        Hints:
        <span>Hint1</span>
      </span>
      <span class="undo">
        <span>Undo</span>
        <span>Redo</span>
      </span>
      <span class="timer">0:15</span>
      <span class="restart">X</span>
    </div>
  `
})
export class MjStatusComponent  { }

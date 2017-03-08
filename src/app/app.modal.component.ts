import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
  <div (click)="hide()" class="modal fade" tabindex="-1" [ngClass]="{'in': visibleAnimate}"
       [ngStyle]="{'display': visible ? 'block' : 'none', 'opacity': visibleAnimate ? 1 : 0}">
    <div class="modal-dialog">
      <div class="modal-content">
        <ng-content></ng-content>
      </div>
      <div class="modal-actions">
        <span *ngFor="let action of actions">
          <button type="button" class="btn" (click)="modal.hide()">{{action}}</button>
        </span>
      </div>
      <div style="clear: both;"></div>
    </div>
  </div>
  `,
  styleUrls: ['app/app.modal.component.css'],
})
export class ModalComponent {
  @Input()
  public actions: string[];

  public visible = false;
  private visibleAnimate = false;

  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true);
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }
}

import { Component, Input } from "@angular/core";
// TODO make modal juicy and jumping out with animation
@Component({
  selector: "modal",
  template: `
    <div
      (click)="hide()"
      class="modal fade"
      tabindex="-1"
      [ngClass]="{ in: visibleAnimate }"
      [ngStyle]="{
        display: visible ? 'block' : 'none',
        opacity: visibleAnimate ? 1 : 0
      }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <ng-content></ng-content>
        </div>
        <div class="clear"></div>
        <div class="modal-actions-wrapper">
          <div class="modal-actions">
            <span *ngFor="let action of actions">
              <button type="button" class="btn" (click)="action.callback()">
                {{ action.name }}
              </button>
            </span>
          </div>
        </div>
        <div style="clear: both;"></div>
      </div>
    </div>
  `,
  styleUrls: ["styles/app.modal.component.css"],
})
export class ModalComponent {
  @Input()
  public actions: ModalAction[];

  public visible = false;
  private visibleAnimate = false;

  public show(): void {
    this.visible = true;
    setTimeout(() => (this.visibleAnimate = true));
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => (this.visible = false), 300);
  }
}

export class ModalAction {
  constructor(
    public name: string,
    public callback: () => void,
    public attributes: Object = {}
  ) {}
}

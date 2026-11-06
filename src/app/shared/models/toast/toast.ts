import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Toast } from '../../../core/services/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container position-fixed top-0 end-0">
      @for (toast of toastService.toasts; track toast) {
        <div class="toast show" [class]="toast.classname" role="alert">
          <div class="toast-body">
            <div class="container-fluid-1">
              <i class="fas" [class]="toast.icon"></i>
            </div>
            <div class="container-fluid-2">
              <h6>{{ toast.title }}</h6>
              <p>{{ toast.textOrTpl }}</p>
            </div>
            <button id="close" (click)="toastService.remove(toast)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastsComponent {
  constructor(public toastService: Toast, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.toastService.toastAdded$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }
}
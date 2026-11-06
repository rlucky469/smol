import { Injectable, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Toast {
  toasts: any[] = [];
  toastAdded$ = new Subject<void>();

  info(msg: string, time = 3000) {
    this.show(msg, { classname: 'bg-info text-dark', icon: 'fa-info-circle', delay: time });
  }

  success(msg: string, time = 3000) {
    this.show(msg, { classname: 'bg-success text-dark', icon: 'fa-check-circle', delay: time });
  }

  danger(msg: string, time = 3000) {
    this.show(msg, { classname: 'bg-danger text-dark', icon: 'fa-times-circle', delay: time });
  }

  warning(msg: string, time = 3000) {
    this.show(msg, { classname: 'bg-warning text-dark', icon: 'fa-exclamation-circle', delay: time });
  }

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    const toast = { textOrTpl, ...options };
    this.toasts.push(toast);

   
    setTimeout(() => this.toastAdded$.next(), 0);

    if (options.delay) {
      setTimeout(() => this.remove(toast), options.delay);
    }
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter((t) => t !== toast);
    setTimeout(() => this.toastAdded$.next(), 0);
  }

  clear() {
    this.toasts = [];
    setTimeout(() => this.toastAdded$.next(), 0);
  }
}
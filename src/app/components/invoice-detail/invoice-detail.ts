import { AfterViewInit, Component, OnDestroy, ViewEncapsulation, inject, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Invoice } from '../../store/invoices/invoices.model';
import { selectGrantProfile } from '../../store/grants/grants.selectors';
import { Login } from '../../core/services/login';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-invoice-detail',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.scss',
  // Print rules must reach <body>, so styles are global (all scoped with .invd-)
  encapsulation: ViewEncapsulation.None,
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class InvoiceDetail implements AfterViewInit, OnDestroy {
  private store = inject(Store);
  private login = inject(Login);

  invoice = input.required<Invoice>();
  autoPrint = input(false);
  closed = output<void>();

  readonly environment = environment;
  readonly member = this.login.getUser() ?? {};
  readonly orgProfile = this.store.selectSignal(selectGrantProfile);

  ngAfterViewInit(): void {
    document.body.classList.add('invd-open');
    if (this.autoPrint()) setTimeout(() => this.print(), 250);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('invd-open', 'invd-printing');
  }

  // Print only the invoice sheet (browser "Save as PDF")
  print(): void {
    const body = document.body;
    const cleanup = () => {
      body.classList.remove('invd-printing');
      window.removeEventListener('afterprint', cleanup);
    };
    body.classList.add('invd-printing');
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('invd-overlay')) this.closed.emit();
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { BreadCrumbs } from '../../core/common/bread-crumbs/bread-crumbs';
import { InvoiceDetail } from '../invoice-detail/invoice-detail';
import { Toast } from '../../core/services/toast';
import { environment } from '../../../environments/environment';
import { InvoicesActions } from '../../store/invoices/invoices.actions';
import { Invoice, InvoiceStatus } from '../../store/invoices/invoices.model';
import {
  selectFilteredCount,
  selectFilteredInvoices,
  selectInvoiceFilters,
  selectInvoicePage,
  selectInvoicePageSize,
  selectInvoiceYears,
  selectInvoicesLoading,
  selectLatestPaymentMethod,
  selectPagedInvoices,
  selectPrintOnOpen,
  selectSelectedInvoice,
  selectYearSummary,
} from '../../store/invoices/invoices.selectors';
import { selectAvailableCredits, selectNextExpiry, selectWalletLoaded } from '../../store/wallet/wallet.selectors';
import { WalletActions } from '../../store/wallet/wallet.actions';

@Component({
  selector: 'app-invoices',
  imports: [BreadCrumbs, InvoiceDetail, NgbPaginationModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './invoices.html',
  styleUrl: './invoices.scss',
})
export class Invoices implements OnInit {
  private store = inject(Store);
  private toast = inject(Toast);

  readonly environment = environment;
  readonly statusOptions: (InvoiceStatus | 'All')[] = ['All', 'Paid', 'Pending', 'Failed'];

  filters = this.store.selectSignal(selectInvoiceFilters);
  invoices = this.store.selectSignal(selectPagedInvoices);
  filtered = this.store.selectSignal(selectFilteredInvoices);
  totalCount = this.store.selectSignal(selectFilteredCount);
  page = this.store.selectSignal(selectInvoicePage);
  pageSize = this.store.selectSignal(selectInvoicePageSize);
  loading = this.store.selectSignal(selectInvoicesLoading);
  years = this.store.selectSignal(selectInvoiceYears);
  summary = this.store.selectSignal(selectYearSummary);
  paymentMethod = this.store.selectSignal(selectLatestPaymentMethod);
  selected = this.store.selectSignal(selectSelectedInvoice);
  printOnOpen = this.store.selectSignal(selectPrintOnOpen);

  walletLoaded = this.store.selectSignal(selectWalletLoaded);
  available = this.store.selectSignal(selectAvailableCredits);
  nextExpiry = this.store.selectSignal(selectNextExpiry);

  ngOnInit(): void {
    document.title = 'Invoices - fundsforNGOs Premium';
    window.scrollTo(0, 0);
        this.store.dispatch(WalletActions.loadWallet());
    this.store.dispatch(InvoicesActions.loadInvoices());

  }

  onSearch(value: string): void {
    this.store.dispatch(InvoicesActions.setFilters({ filters: { search: value } }));
  }

  onStatus(value: string): void {
    this.store.dispatch(InvoicesActions.setFilters({ filters: { status: value as InvoiceStatus | 'All' } }));
  }

  onYear(value: string): void {
    this.store.dispatch(InvoicesActions.setFilters({ filters: { year: value } }));
  }

  onPageChange(page: number): void {
    this.store.dispatch(InvoicesActions.setPage({ page }));
  }

  view(invoice: Invoice): void {
    this.store.dispatch(InvoicesActions.openInvoice({ invoiceNo: invoice.invoiceNo, print: false }));
  }

  download(invoice: Invoice): void {
    this.store.dispatch(InvoicesActions.openInvoice({ invoiceNo: invoice.invoiceNo, print: true }));
  }

  close(): void {
    this.store.dispatch(InvoicesActions.closeInvoice());
  }

  // TODO: hook to the payment API once available
  retry(invoice: Invoice): void {
    this.toast.info(`Payment retry for ${invoice.invoiceNo} will be available soon.`, 3000);
  }

  showingFrom(): number {
    return this.totalCount() ? (this.page() - 1) * this.pageSize() + 1 : 0;
  }

  showingTo(): number {
    return Math.min(this.page() * this.pageSize(), this.totalCount());
  }

  exportCsv(): void {
    const rows = this.filtered();
    if (!rows.length) {
      this.toast.warning('No invoices to export.', 2500);
      return;
    }

    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ['Invoice', 'Date', 'Description', 'Amount', 'Currency', 'Status', 'Transaction'];
    const lines = rows.map((i) =>
      [i.invoiceNo, i.date.slice(0, 10), i.description, i.amount.toFixed(2), i.currency, i.status, i.transactionId].map(escape).join(',')
    );

    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

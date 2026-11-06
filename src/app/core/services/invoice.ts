import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { Billing } from './billing';
import { Invoice, InvoiceStatus } from '../../store/invoices/invoices.model';

const PAGE_SIZE = 100;

function toStatus(raw: string): InvoiceStatus {
  const v = (raw ?? '').toLowerCase();
  if (['success', 'paid', 'completed'].includes(v)) return 'Paid';
  if (['failed', 'failure', 'cancelled', 'canceled', 'expired'].includes(v)) return 'Failed';
  return 'Pending';
}

// API item -> shape the UI already uses
function toInvoice(i: any): Invoice {
  const credits = (Number(i.creditsPurchased) || 0) + (Number(i.bonusCredits) || 0);
  return {
    invoiceNo: i.invoiceNo,
    date: i.invoiceDate,
    description: i.planName,
    detail: `${credits.toLocaleString()} AI credits`,
    quantity: 1,
    amount: Number(i.totalAmount) || 0,
    currency: 'USD',
    status: toStatus(i.paymentStatus),
    transactionId: i.invoiceNo, // API has no separate transaction id
    paymentMethod: { brand: i.paymentGateway ?? '', last4: '' }, // API has no card digits
  };
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private billing = inject(Billing);

  getInvoices(): Observable<{ status: number; invoices: Invoice[] }> {
    return this.billing.getInvoices(1, PAGE_SIZE).pipe(
      switchMap((first) => {
        if (first?.status !== 1) return of({ status: 0, invoices: [] as Invoice[] });

        const items: any[] = [...(first.data?.items ?? [])];
        const pages = Math.ceil((first.data?.totalCount ?? 0) / PAGE_SIZE);

        // fetch remaining pages only if there are more than PAGE_SIZE invoices
        const rest = Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
          this.billing.getInvoices(i + 2, PAGE_SIZE)
        );
        const rest$ = rest.length ? forkJoin(rest) : of([] as any[]);

        return rest$.pipe(
          map((others) => {
            others.forEach((o) => items.push(...(o?.data?.items ?? [])));
            return { status: 1, invoices: items.map(toInvoice) };
          })
        );
      })
    );
  }
}
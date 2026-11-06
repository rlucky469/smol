import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Invoice, InvoiceFilters } from './invoices.model';

export const InvoicesActions = createActionGroup({
  source: 'Invoices',
  events: {
    'Load Invoices': emptyProps(),
    'Load Invoices Success': props<{ invoices: Invoice[] }>(),
    'Load Invoices Failure': props<{ error: any }>(),

    'Set Filters': props<{ filters: Partial<InvoiceFilters> }>(),
    'Set Page': props<{ page: number }>(),

    'Open Invoice': props<{ invoiceNo: string; print: boolean }>(),
    'Close Invoice': emptyProps(),
  },
});

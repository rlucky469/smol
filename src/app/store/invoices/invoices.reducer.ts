import { createReducer, on } from '@ngrx/store';
import { InvoicesActions } from './invoices.actions';
import { InvoicesState } from './invoices.model';

const initialState: InvoicesState = {
  invoices: [],
  loading: false,
  loaded: false,
  error: null,
  filters: { search: '', status: 'All', year: 'All' },
  page: 1,
  pageSize: 6,
  selectedInvoiceNo: null,
  printOnOpen: false,
};

export const invoicesReducer = createReducer(
  initialState,

  on(InvoicesActions.loadInvoices, (state) => ({ ...state, loading: true })),
  on(InvoicesActions.loadInvoicesSuccess, (state, { invoices }) => ({ ...state, loading: false, loaded: true, invoices, error: null })),
  on(InvoicesActions.loadInvoicesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(InvoicesActions.setFilters, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters }, page: 1 })),
  on(InvoicesActions.setPage, (state, { page }) => ({ ...state, page })),

  on(InvoicesActions.openInvoice, (state, { invoiceNo, print }) => ({ ...state, selectedInvoiceNo: invoiceNo, printOnOpen: print })),
  on(InvoicesActions.closeInvoice, (state) => ({ ...state, selectedInvoiceNo: null, printOnOpen: false })),
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InvoicesState } from './invoices.model';

export const selectInvoicesState = createFeatureSelector<InvoicesState>('invoices');

export const selectAllInvoices = createSelector(selectInvoicesState, (s) => s.invoices);
export const selectInvoicesLoading = createSelector(selectInvoicesState, (s) => s.loading);
export const selectInvoiceFilters = createSelector(selectInvoicesState, (s) => s.filters);
export const selectInvoicePage = createSelector(selectInvoicesState, (s) => s.page);
export const selectInvoicePageSize = createSelector(selectInvoicesState, (s) => s.pageSize);
export const selectPrintOnOpen = createSelector(selectInvoicesState, (s) => s.printOnOpen);

export const selectInvoiceYears = createSelector(selectAllInvoices, (list) =>
  [...new Set(list.map((i) => i.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a))
);

export const selectFilteredInvoices = createSelector(selectAllInvoices, selectInvoiceFilters, (list, f) => {
  const q = f.search.trim().toLowerCase();
  return list
    .filter((i) => !q || i.invoiceNo.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    .filter((i) => f.status === 'All' || i.status === f.status)
    .filter((i) => f.year === 'All' || i.date.startsWith(f.year))
    .sort((a, b) => b.date.localeCompare(a.date));
});

export const selectFilteredCount = createSelector(selectFilteredInvoices, (list) => list.length);

export const selectPagedInvoices = createSelector(
  selectFilteredInvoices,
  selectInvoicePage,
  selectInvoicePageSize,
  (list, page, size) => list.slice((page - 1) * size, page * size)
);

// Paid totals for the current calendar year
export const selectYearSummary = createSelector(selectAllInvoices, (list) => {
  const year = String(new Date().getFullYear());
  const yearList = list.filter((i) => i.date.startsWith(year));
  return {
    year,
    totalSpent: yearList.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0),
    count: yearList.length,
  };
});

export const selectLatestPaymentMethod = createSelector(
  selectAllInvoices,
  (list) => [...list].sort((a, b) => b.date.localeCompare(a.date))[0]?.paymentMethod ?? null
);

export const selectSelectedInvoice = createSelector(
  selectInvoicesState,
  (s) => s.invoices.find((i) => i.invoiceNo === s.selectedInvoiceNo) ?? null
);

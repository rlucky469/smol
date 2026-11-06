export type InvoiceStatus = 'Paid' | 'Pending' | 'Failed';

export interface Invoice {
  invoiceNo: string;
  date: string;
  description: string;
  detail: string;
  quantity: number;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  transactionId: string;
  paymentMethod: { brand: string; last4: string };
}

export interface InvoiceFilters {
  search: string;
  status: InvoiceStatus | 'All';
  year: string;
}

export interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  loaded: boolean;
  error: any;
  filters: InvoiceFilters;
  page: number;
  pageSize: number;
  selectedInvoiceNo: string | null;
  printOnOpen: boolean;
}

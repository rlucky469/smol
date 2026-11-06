import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { InvoicesActions } from './invoices.actions';
import { InvoiceService } from '../../core/services/invoice';

@Injectable()
export class InvoicesEffects {
  private actions$ = inject(Actions);
  private invoiceService = inject(InvoiceService);

  loadInvoices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.loadInvoices),
      switchMap(() =>
        this.invoiceService.getInvoices().pipe(
          map((res) =>
            res?.status === 1
              ? InvoicesActions.loadInvoicesSuccess({ invoices: res.invoices ?? [] })
              : InvoicesActions.loadInvoicesFailure({ error: 'Failed to load invoices' })
          ),
          catchError((error) => of(InvoicesActions.loadInvoicesFailure({ error })))
        )
      )
    )
  );
}

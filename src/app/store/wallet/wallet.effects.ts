import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, filter, map, of, switchMap, tap } from 'rxjs';
import { WalletActions } from './wallet.actions';
import { Billing } from '../../core/services/billing';
import { Toast } from '../../core/services/toast';


@Injectable()
export class WalletEffects {
  private actions$ = inject(Actions);
  private billing = inject(Billing);
  private toast = inject(Toast);

  loadWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.loadWallet),
      switchMap(() =>
        this.billing.getWallet().pipe(
          map((res) =>
            res?.status === 1
              ? WalletActions.loadWalletSuccess({ wallet: res.wallet })
              : WalletActions.loadWalletFailure({ error: res?.message })
          ),
          catchError((error) => of(WalletActions.loadWalletFailure({ error })))
        )
      )
    )
  );

  // mergeMap so parallel AI calls are each billed
  chargeUsage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.chargeUsage),
      concatMap(({ request }) =>
        this.billing.charge(request).pipe(
          map((res) =>
            res?.status === 1
              ? WalletActions.chargeUsageSuccess({ result: res.result })
              : WalletActions.chargeUsageFailure({ error: res?.message })
          ),
          catchError((error) => of(WalletActions.chargeUsageFailure({ error })))
        )
      )
    )
  );

  // Balance was lower than the real cost -> tell the user
  shortfallWarning$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WalletActions.chargeUsageSuccess),
        filter(({ result }) => (result?.shortfall ?? 0) > 0),
        tap(({ result }) =>
          this.toast.warning(
            `Your credits ran out. ${result.shortfall} credits could not be charged. Please top up.`,
            5000
          )
        )
      ),
    { dispatch: false }
  );

  // Resync balance from server whenever a charge fails
  resyncOnFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WalletActions.chargeUsageFailure),
      map(() => WalletActions.loadWallet())
    )
  );
}
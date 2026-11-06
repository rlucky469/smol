import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, withLatestFrom } from 'rxjs';
import { PlansActions } from './plans.actions';
import { selectPlansLoaded } from './plans.selectors';
import { Billing } from '../../core/services/billing';

@Injectable()
export class PlansEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private billing = inject(Billing);

  // Plans rarely change, so fetch only once per session
  loadPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.loadPlans),
      withLatestFrom(this.store.select(selectPlansLoaded)),
      filter(([, loaded]) => !loaded),
      switchMap(() =>
        this.billing.getPlans().pipe(
          map((res) =>
            res?.status === 1
              ? PlansActions.loadPlansSuccess({ plans: res.plans ?? [] })
              : PlansActions.loadPlansFailure({ error: res?.message })
          ),
          catchError((error) => of(PlansActions.loadPlansFailure({ error })))
        )
      )
    )
  );
}

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { GrantsActions } from './grants.actions';
import { selectGrantsState } from './grants.selectors';
import { EMPTY_GRANT_STATS, MATCH_API_MAP, SORT_API_MAP, TYPE_API_MAP } from './grants.model';
import { WalletActions } from '../wallet/wallet.actions';
import { chargeActions } from '../wallet/wallet.utils';
import { Api } from '../../core/services/api';
import { environment } from '../../../environments/environment';

@Injectable()
export class GrantsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private api = inject(Api);
  private router = inject(Router);

  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GrantsActions.loadProfile),
      switchMap(({ profileId }) =>
        this.api.apiPost(`${environment.nodeApiUrl}/ngo-analyzer/profile`, { memberIndex: profileId }).pipe(
          map((res: any) =>
            res?.successCode === 1
              ? GrantsActions.loadProfileSuccess({
                profile: { name: res.result.name, description: res.result.description },
                countryIds: res.result.countryIds ?? [],
                issueIds: res.result.issueIds ?? [],
              })
              : GrantsActions.loadProfileFailure({ error: res?.message })
          ),
          catchError((error) => of(GrantsActions.loadProfileFailure({ error })))
        )
      )
    )
  );

  // No profile yet → user must analyze first
  profileMissing$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GrantsActions.loadProfileFailure),
        tap(() => this.router.navigate(['/analyze-profile']))
      ),
    { dispatch: false }
  );

  // Load, filters, pagination and profile save are free
  freeReload$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        GrantsActions.loadProfileSuccess,
        GrantsActions.setFilters,
        GrantsActions.setPage,
        GrantsActions.clearFilters,
        GrantsActions.updateProfileSuccess
      ),
      map(() => GrantsActions.loadGrants({ charge: false }))
    )
  );

  // Only a search with text is billed
  searchReload$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GrantsActions.searchGrants),
      map(({ searchText }) => GrantsActions.loadGrants({ charge: !!searchText.trim() }))
    )
  );

  loadGrants$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GrantsActions.loadGrants),
      withLatestFrom(this.store.select(selectGrantsState)),
      switchMap(([{ charge }, s]) => {
        const f = s.filters;
        const payload: any = {
          filters: {
            searchText: f.searchText.trim(),
            grantSize: f.amount === 'All Amounts' ? '' : f.amount,
            matchQuality: MATCH_API_MAP[f.match] || '',
            types: TYPE_API_MAP[f.type] || '',
            sortBy: SORT_API_MAP[f.sortBy] || '',
            pageIndex: s.page,
            pageSize: s.pageSize,
          },
        };

        if (s.countryIds.length && s.issueIds.length) {
          payload.countryIds = s.countryIds;
          payload.issueIds = s.issueIds;
        } else {
          payload.ngoProfileId = s.profileId;
        }

        return this.api.apiPost(`${environment.nodeApiUrl}/ngo-analyzer/grant-match`, payload).pipe(
          mergeMap((res: any) => {
            if (res?.successCode !== 1) return [GrantsActions.loadGrantsFailure({ error: res?.message })];

            const actions: any[] = [
              GrantsActions.loadGrantsSuccess({
                grants: res.result.grants ?? [],
                stats: res.result.stats ?? EMPTY_GRANT_STATS,
                countryIds: res.result.countryIds,
                issueIds: res.result.issueIds,
              }),
            ];
            if (charge) {
              actions.push(...chargeActions('GrantMatch', f.searchText, res.result));
            }
            return actions;
          }),
          catchError((error) => of(GrantsActions.loadGrantsFailure({ error })))
        );
      })
    )
  );

  updateProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GrantsActions.updateProfile),
      withLatestFrom(this.store.select(selectGrantsState)),
      switchMap(([{ update }, s]) =>
        this.api.apiPatch(`${environment.nodeApiUrl}/ngo-analyzer/profile/${s.profileId}`, update).pipe(
          map((res: any) =>
            res?.successCode === 1
              ? GrantsActions.updateProfileSuccess({ update })
              : GrantsActions.updateProfileFailure({ error: res?.message })
          ),
          catchError((error) => of(GrantsActions.updateProfileFailure({ error })))
        )
      )
    )
  );

  scrollTop$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(GrantsActions.setPage, GrantsActions.updateProfileSuccess),
        tap(() => window.scrollTo(0, 0))
      ),
    { dispatch: false }
  );
}

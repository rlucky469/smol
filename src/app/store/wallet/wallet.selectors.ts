import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from './wallet.model';

export const selectWalletState = createFeatureSelector<WalletState>('wallet');

export const selectWallet = createSelector(selectWalletState, (s) => s.wallet);
export const selectWalletLoaded = createSelector(selectWalletState, (s) => s.loaded);
export const selectWalletLoading = createSelector(selectWalletState, (s) => s.loading);
export const selectLastCharge = createSelector(selectWalletState, (s) => s.lastCharge);

export const selectAvailableCredits = createSelector(selectWallet, (w) => w?.availableCredits ?? 0);
export const selectUsedCredits = createSelector(selectWallet, (w) => w?.usedCredits ?? 0);
export const selectNextExpiry = createSelector(selectWallet, (w) => w?.nextExpiryOn ?? null);

export const selectTotalCredits = createSelector(
  selectAvailableCredits,
  selectUsedCredits,
  (available, used) => available + used
);

export const selectRemainingPercent = createSelector(
  selectAvailableCredits,
  selectTotalCredits,
  (available, total) => (total > 0 ? Math.round((available / total) * 100) : 0)
);

// Unknown balance (not loaded yet / failed) never blocks the user
export const selectHasCredits = createSelector(
  selectWalletLoaded,
  selectAvailableCredits,
  (loaded, available) => !loaded || available > 0
);

export const selectIsLowCredits = createSelector(
  selectWalletLoaded,
  selectAvailableCredits,
  selectRemainingPercent,
  (loaded, available, pct) => loaded && available > 0 && pct < 20
);

export const selectIsOutOfCredits = createSelector(
  selectWalletLoaded,
  selectAvailableCredits,
  (loaded, available) => loaded && available <= 0
);

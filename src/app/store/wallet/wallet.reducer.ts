import { createReducer, on } from '@ngrx/store';
import { WalletActions } from './wallet.actions';
import { WalletState } from './wallet.model';

export const initialWalletState: WalletState = {
  wallet: null,
  loading: false,
  loaded: false,
  charging: false,
  lastCharge: null,
  error: null,
};

export const walletReducer = createReducer(
  initialWalletState,

  on(WalletActions.loadWallet, (state) => ({ ...state, loading: true })),

  on(WalletActions.loadWalletSuccess, (state, { wallet }) => ({
    ...state,
    loading: false,
    loaded: true,
    wallet,
    error: null,
  })),

  on(WalletActions.loadWalletFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(WalletActions.chargeUsage, (state) => ({ ...state, charging: true })),

  // Balance comes from the server, used count is bumped locally
  on(WalletActions.chargeUsageSuccess, (state, { result }) => ({
    ...state,
    charging: false,
    lastCharge: result,
    wallet: state.wallet
      ? {
          ...state.wallet,
          availableCredits: result.remainingCredits,
          usedCredits: state.wallet.usedCredits + (result.duplicate ? 0 : result.creditsCharged),
        }
      : state.wallet,
  })),

  on(WalletActions.chargeUsageFailure, (state, { error }) => ({ ...state, charging: false, error })),
);

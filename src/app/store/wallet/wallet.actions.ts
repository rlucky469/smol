import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ChargeRequest, ChargeResult, Wallet } from './wallet.model';

export const WalletActions = createActionGroup({
  source: 'Wallet',
  events: {
    'Load Wallet': emptyProps(),
    'Load Wallet Success': props<{ wallet: Wallet }>(),
    'Load Wallet Failure': props<{ error: any }>(),

    'Charge Usage': props<{ request: ChargeRequest }>(),
    'Charge Usage Success': props<{ result: ChargeResult }>(),
    'Charge Usage Failure': props<{ error: any }>(),
  },
});

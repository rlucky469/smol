// store/index.ts
import { ActionReducerMap } from '@ngrx/store';
import { routerReducer } from '@ngrx/router-store';

export interface AppState {
  router: any;
  
}

export const appReducers: ActionReducerMap<AppState> = {
  router: routerReducer,

};

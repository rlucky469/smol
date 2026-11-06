import { createReducer, on } from '@ngrx/store';
import { PlansActions } from './plans.actions';
import { PlansState } from './plans.model';

const initialState: PlansState = {
  plans: [],
  loading: false,
  loaded: false,
  error: null,
};

export const plansReducer = createReducer(
  initialState,
  on(PlansActions.loadPlans, (state) => ({ ...state, loading: true })),
  on(PlansActions.loadPlansSuccess, (state, { plans }) => ({ ...state, loading: false, loaded: true, plans, error: null })),
  on(PlansActions.loadPlansFailure, (state, { error }) => ({ ...state, loading: false, error })),
);

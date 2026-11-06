import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlansState } from './plans.model';

export const selectPlansState = createFeatureSelector<PlansState>('plans');

export const selectPlans = createSelector(selectPlansState, (s) => s.plans);
export const selectPlansLoading = createSelector(selectPlansState, (s) => s.loading);
export const selectPlansLoaded = createSelector(selectPlansState, (s) => s.loaded);

// Plan with the lowest price per credit gets the "Best Value" ribbon
export const selectBestValuePlanId = createSelector(selectPlans, (plans) => {
  if (plans.length < 2) return null;
  const rate = (p: (typeof plans)[number]) => p.priceUSD / Math.max(1, p.credits + p.bonusCredits);
  return [...plans].sort((a, b) => rate(a) - rate(b))[0].aiPlanIndex;
});

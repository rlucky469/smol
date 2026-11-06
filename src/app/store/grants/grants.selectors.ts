import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DEFAULT_GRANT_FILTERS, GrantFilters, GrantsState } from './grants.model';

export const selectGrantsState = createFeatureSelector<GrantsState>('grants');

export const selectGrants = createSelector(selectGrantsState, (s) => s.grants);
export const selectGrantStats = createSelector(selectGrantsState, (s) => s.stats);
export const selectGrantsLoading = createSelector(selectGrantsState, (s) => s.loading);
export const selectGrantFilters = createSelector(selectGrantsState, (s) => s.filters);
export const selectGrantPage = createSelector(selectGrantsState, (s) => s.page);
export const selectGrantPageSize = createSelector(selectGrantsState, (s) => s.pageSize);
export const selectGrantProfile = createSelector(selectGrantsState, (s) => s.profile);
export const selectInitialCountryIds = createSelector(selectGrantsState, (s) => s.initialCountryIds);
export const selectInitialIssueIds = createSelector(selectGrantsState, (s) => s.initialIssueIds);

export interface ActiveFilterChip {
  key: keyof GrantFilters;
  label: string;
}

// Chips for every filter that differs from its default
export const selectActiveGrantFilters = createSelector(selectGrantFilters, (f): ActiveFilterChip[] =>
  (Object.keys(DEFAULT_GRANT_FILTERS) as (keyof GrantFilters)[])
    .filter((key) => key !== 'sortBy' && f[key] !== DEFAULT_GRANT_FILTERS[key] && f[key] !== '')
    .map((key) => ({ key, label: key === 'searchText' ? `"${f[key]}"` : f[key] }))
);

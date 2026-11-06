import { createReducer, on } from '@ngrx/store';
import { GrantsActions } from './grants.actions';
import { DEFAULT_GRANT_FILTERS, EMPTY_GRANT_STATS, GrantsState } from './grants.model';

const initialState: GrantsState = {
  profileId: null,
  profile: { name: '', description: '' },
  profileLoaded: false,
  initialCountryIds: [],
  initialIssueIds: [],
  countryIds: [],
  issueIds: [],
  filters: DEFAULT_GRANT_FILTERS,
  page: 1,
  pageSize: 9,
  grants: [],
  stats: EMPTY_GRANT_STATS,
  loading: false,
  error: null,
};

export const grantsReducer = createReducer(
  initialState,

  on(GrantsActions.loadProfile, (state, { profileId }) => ({ ...state, profileId, loading: true })),

  on(GrantsActions.loadProfileSuccess, (state, { profile, countryIds, issueIds }) => ({
    ...state,
    profile,
    profileLoaded: true,
    initialCountryIds: countryIds,
    initialIssueIds: issueIds,
  })),

  on(GrantsActions.loadProfileFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(GrantsActions.loadGrants, (state) => ({ ...state, loading: true })),

  on(GrantsActions.loadGrantsSuccess, (state, { grants, stats, countryIds, issueIds }) => ({
    ...state,
    loading: false,
    grants,
    stats,
    countryIds: countryIds ?? state.countryIds,
    issueIds: issueIds ?? state.issueIds,
    error: null,
  })),

  on(GrantsActions.loadGrantsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(GrantsActions.searchGrants, (state, { searchText }) => ({
    ...state,
    filters: { ...state.filters, searchText },
    page: 1,
  })),

  on(GrantsActions.setFilters, (state, { filters }) => ({ ...state, filters: { ...state.filters, ...filters }, page: 1 })),

  on(GrantsActions.setPage, (state, { page }) => ({ ...state, page })),

  on(GrantsActions.clearFilters, (state) => ({ ...state, filters: DEFAULT_GRANT_FILTERS, page: 1 })),

  on(GrantsActions.updateProfileSuccess, (state, { update }) => ({
    ...state,
    profile: { name: update.name, description: update.description },
    initialCountryIds: update.countryIds,
    initialIssueIds: update.issueIds,
    countryIds: update.countryIds,
    issueIds: update.issueIds,
    page: 1,
  })),

  on(GrantsActions.reset, () => initialState),
);

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { GrantFilters, GrantProfile, GrantStats, IGrant } from './grants.model';

export interface ProfileUpdate {
  name: string;
  description: string;
  countryIds: number[];
  issueIds: number[];
}

export const GrantsActions = createActionGroup({
  source: 'Grants',
  events: {
    'Load Profile': props<{ profileId: string }>(),
    'Load Profile Success': props<{ profile: GrantProfile; countryIds: number[]; issueIds: number[] }>(),
    'Load Profile Failure': props<{ error: any }>(),

    // charge = true only for a user-triggered search
    'Load Grants': props<{ charge: boolean }>(),
    'Load Grants Success': props<{ grants: IGrant[]; stats: GrantStats; countryIds: number[]; issueIds: number[] }>(),
    'Load Grants Failure': props<{ error: any }>(),

    'Search Grants': props<{ searchText: string }>(),
    'Set Filters': props<{ filters: Partial<GrantFilters> }>(),
    'Set Page': props<{ page: number }>(),
    'Clear Filters': emptyProps(),

    'Update Profile': props<{ update: ProfileUpdate }>(),
    'Update Profile Success': props<{ update: ProfileUpdate }>(),
    'Update Profile Failure': props<{ error: any }>(),

    'Reset': emptyProps(),
  },
});

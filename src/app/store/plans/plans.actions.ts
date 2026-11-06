import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AiPlan } from './plans.model';

export const PlansActions = createActionGroup({
  source: 'Plans',
  events: {
    'Load Plans': emptyProps(),
    'Load Plans Success': props<{ plans: AiPlan[] }>(),
    'Load Plans Failure': props<{ error: any }>(),
  },
});

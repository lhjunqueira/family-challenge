import {
  createAction,
  createReducer,
  on,
  createSelector,
  createFeatureSelector,
  props,
} from '@ngrx/store';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs';
import { FamilyModel } from '../../features/modules/families/models/family.model';
import { FamiliesService } from '../../features/modules/families/service/families.service';

export interface FamiliesState {
  families: FamilyModel[];
}

const initialState: FamiliesState = {
  families: [],
};

export const loadProfiles = createAction('[Profiles] Load');
export const loadFamilies = createAction('[Families] Load');
export const loadFamiliesSuccess = createAction(
  '[Families] Load Success',
  props<{ families: FamilyModel[] }>()
);

export const familiesReducer = createReducer(
  initialState,
  on(loadFamiliesSuccess, (state, { families }) => ({ ...state, families }))
);

export const selectFamiliesState =
  createFeatureSelector<FamiliesState>('families');
export const selectAllFamilies = createSelector(
  selectFamiliesState,
  (state) => state.families
);

@Injectable()
export class FamiliesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly familiesService: FamiliesService
  ) {}

  loadFamilies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFamilies),
      mergeMap(() =>
        this.familiesService
          .getFamilies()
          .pipe(
            map((families) => loadFamiliesSuccess({ families: families.items }))
          )
      )
    )
  );
}

export const familiesFeature = {
  name: 'families',
  reducer: familiesReducer,
  effects: [FamiliesEffects],
};

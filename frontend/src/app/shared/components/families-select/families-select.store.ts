import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FamiliesService } from '../../../features/modules/families/service/families.service';
import { FamilyModel } from '../../../features/modules/families/models/family.model';

interface FamiliesSelectState {
  families: FamilyModel[];
  loading: boolean;
  search: string;
  loaded: boolean;
}

const initialState: FamiliesSelectState = {
  families: [],
  loading: false,
  search: '',
  loaded: false,
};

@Injectable()
export class FamiliesSelectStore extends ComponentStore<FamiliesSelectState> {
  constructor(private readonly familiesService: FamiliesService) {
    super(initialState);
  }

  readonly families$ = this.select((s) => s.families);
  readonly loading$ = this.select((s) => s.loading);
  readonly search$ = this.select((s) => s.search);
  readonly loaded$ = this.select((s) => s.loaded);

  readonly setFamilies = this.updater((state, families: FamilyModel[]) => ({
    ...state,
    families,
    loaded: true,
  }));
  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
  }));
  readonly setSearch = this.updater((state, search: string) => ({
    ...state,
    search,
  }));

  readonly loadFamilies = this.effect<unknown>((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.search$),
      tap(() => this.setLoading(true)),
      switchMap(([, search]) =>
        this.familiesService
          .getFamilies({ search: search?.trim() ?? '', limit: 100 })
          .pipe(
            tap(
              (res) => {
                this.setFamilies(res.items ?? []);
                this.setLoading(false);
              },
              () => this.setLoading(false)
            )
          )
      )
    )
  );

  fetch(search?: string) {
    if (typeof search === 'string') this.setSearch(search);
    this.loadFamilies(undefined);
  }
}

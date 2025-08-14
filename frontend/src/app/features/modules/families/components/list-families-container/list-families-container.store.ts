import { Injectable, signal } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap, withLatestFrom } from 'rxjs';
import { FamilyModel } from '../../models/family.model';
import { FamiliesService } from '../../service/families.service';
import { FilterFamiliesPaginatedDto } from '../../dto/filter-families-paginated.dto';
import { CreateUpdateFamilyDto } from '../../dto/create-update-family.dto';
import { ListPaginated } from '../../../../../shared/models/list-paginated.model';

interface FamiliesStoreState {
  families: FamilyModel[];
  filter: FilterFamiliesPaginatedDto;
  total: number;
}

const initialState: FamiliesStoreState = {
  families: [],
  filter: { search: '' },
  total: 0,
};

@Injectable()
export class FamiliesStore extends ComponentStore<FamiliesStoreState> {
  constructor(private familiesService: FamiliesService) {
    super(initialState);
  }

  families$ = this.select((state) => state.families);
  filter$ = this.select((state) => state.filter);
  total$ = this.select((state) => state.total);

  readonly setFamilies = this.updater(
    (state: FamiliesStoreState, families: ListPaginated<FamilyModel>) => ({
      ...state,
      families: families.items,
      total: families.total,
    })
  );
  readonly setFilter = this.updater(
    (state: FamiliesStoreState, filter: FilterFamiliesPaginatedDto) => ({
      ...state,
      filter,
    })
  );
  readonly setUpdatedFamily = this.updater(
    (state: FamiliesStoreState, family: FamilyModel) => ({
      ...state,
      families: state.families.map((f) => (f.id === family.id ? family : f)),
    })
  );

  readonly loadFamilies$ = this.effect((empty$: Observable<void>) =>
    empty$.pipe(
      withLatestFrom(this.filter$),
      switchMap(([_, filter]) =>
        this.familiesService
          .getFamilies(filter)
          .pipe(tap((families) => this.setFamilies(families)))
      )
    )
  );

  readonly createFamily$ = this.effect(
    (family$: Observable<CreateUpdateFamilyDto>) =>
      family$.pipe(
        withLatestFrom(this.filter$),
        switchMap(([family, filter]) =>
          this.familiesService.createFamily(family).pipe(
            tap((newFamily) => {
              if (newFamily) {
                this.setFilter({ ...filter, page: 0 });
                this.loadFamilies$();
              }
            })
          )
        )
      )
  );

  readonly updateFamily$ = this.effect(
    (family$: Observable<{ id: string; dto: CreateUpdateFamilyDto }>) =>
      family$.pipe(
        switchMap(({ id, dto }) =>
          this.familiesService
            .updateFamily(id, dto)
            .pipe(tap((updatedFamily) => this.setUpdatedFamily(updatedFamily)))
        )
      )
  );

  readonly deleteFamily$ = this.effect((familyId$: Observable<string>) =>
    familyId$.pipe(
      switchMap((familyId) =>
        this.familiesService.deleteFamily(familyId).pipe(
          tap((family) => {
            if (family) this.loadFamilies$();
          })
        )
      )
    )
  );

  readonly setPage$ = this.effect((page$: Observable<number>) =>
    page$.pipe(
      withLatestFrom(this.filter$),
      tap(([page, filter]) => {
        this.setFilter({ ...filter, page });
        this.loadFamilies$();
      })
    )
  );
}

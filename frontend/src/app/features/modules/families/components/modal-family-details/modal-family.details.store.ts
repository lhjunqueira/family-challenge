import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { FamiliesService } from '../../../families/service/families.service';
import { FamilyModel } from '../../../families/models/family.model';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';
interface FamilyDetailsState {
  id: string | null;
  family: FamilyModel | null;
  status: LoadStatus;
  error: string | null;
}

const initialState: FamilyDetailsState = {
  id: null,
  family: null,
  status: 'idle',
  error: null,
};

@Injectable()
export class ModalFamilyDetailsStore extends ComponentStore<FamilyDetailsState> {
  constructor(private readonly familiesService: FamiliesService) {
    super(initialState);
  }

  readonly family$ = this.select((s) => s.family);
  readonly loading$ = this.select((s) => s.status === 'loading');
  readonly loaded$ = this.select((s) => s.status === 'success');
  readonly error$ = this.select((s) => s.error);
  readonly id$ = this.select((s) => s.id);

  readonly setId = this.updater((state, id: string | null) => ({
    ...state,
    id,
  }));
  readonly setFamily = this.updater((state, family: FamilyModel | null) => ({
    ...state,
    family,
    status: family ? 'success' : state.status,
    error: null,
  }));
  readonly setLoading = this.updater((state) => ({
    ...state,
    status: 'loading',
    error: null,
  }));
  readonly setError = this.updater((state, error: string | null) => ({
    ...state,
    error,
    status: 'error',
  }));

  readonly loadFamily = this.effect<string | null>((id$) =>
    id$.pipe(
      tap((id) => {
        if (!id) {
          this.setFamily(null);
          return;
        }
        this.setId(id);
        this.setLoading();
      }),
      switchMap((id) => {
        if (!id) return of(null);
        return this.familiesService.getFamilyById(id).pipe(
          tap({
            next: (family) => this.setFamily(family),
          }),
          catchError((err: any) => {
            this.setError(err?.message ?? 'Erro ao carregar família');
            return of(null);
          })
        );
      })
    )
  );

  fetch(id: string | null) {
    this.loadFamily(id);
  }

  refresh() {
    const currentId = this.get((s) => s.id);
    if (currentId) this.loadFamily(currentId);
  }

  clear() {
    this.setId(null);
    this.setFamily(null);
    this.setError(null);
    this.patchState({ status: 'idle' });
  }
}

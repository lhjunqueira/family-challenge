import { Component, inject, OnInit } from '@angular/core';
import { FamiliesService } from '../../service/families.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FamilyModel } from '../../models/family.model';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FamiliesStore } from './list-families-container.store';
import {
  debounceTime,
  distinctUntilChanged,
  first,
  Observable,
  startWith,
} from 'rxjs';
import {
  ModalCreateUpdateFamilyComponent,
  ModalCreateUpdateFamilyInterface,
  ModalCreateUpdateFamilyResponse,
} from '../modal-create-update-family/modal-create-update-family.component';
import { MediaMatcher } from '@angular/cdk/layout';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import {
  ModalFamilyDetailsComponent,
  ModalFamilyDetailsInterface,
} from '../modal-family-details/modal-family-details.component';
import { openResponsiveModal } from 'app/shared/utils/open-responsive-modal.util';

@Component({
  selector: 'app-list-families-container',
  templateUrl: './list-families-container.component.html',
  styleUrls: ['./list-families-container.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    AsyncPipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCardModule,
    CpfPipe,
  ],
  providers: [FamiliesStore],
})
export class ListFamiliesContainerComponent {
  familyStore = inject(FamiliesStore);

  constructor(
    private readonly mediaMatcher: MediaMatcher,
    private readonly matBottomSheet: MatBottomSheet,
    private readonly matDialog: MatDialog
  ) {
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        debounceTime(500),
        distinctUntilChanged(
          (prev, curr) => (prev?.search || '') === (curr?.search || '')
        )
      )
      .subscribe((formValues) => {
        this.familyStore.setFilter({ search: formValues.search ?? undefined });
        this.familyStore.loadFamilies$();
      });
  }

  families$ = this.familyStore.families$;
  totalFamilies$ = this.familyStore.total$;

  displayedColumns = ['name', 'birthDate', 'document', 'actions'];

  form = new FormGroup<FamilySearchFormInterface>({
    search: new FormControl(''),
  });

  trackByFamilyId = (_: number, item: FamilyModel) => item.id;

  createFamily() {
    this.openModalToCreateAndEditFamily();
  }

  editFamily(family: FamilyModel) {
    this.openModalToCreateAndEditFamily(family);
  }

  deleteFamily(family: FamilyModel) {
    this.familyStore.deleteFamily$(family.id);
  }

  onPageChange(event: PageEvent) {
    this.familyStore.setPage$(event.pageIndex);
  }

  openModalToCreateAndEditFamily(family?: FamilyModel) {
    const data: ModalCreateUpdateFamilyInterface = { family };
    const afterDismissed = openResponsiveModal<
      ModalCreateUpdateFamilyInterface,
      ModalCreateUpdateFamilyResponse
    >(
      this.mediaMatcher,
      this.matDialog,
      this.matBottomSheet,
      ModalCreateUpdateFamilyComponent,
      data
    );

    afterDismissed.pipe(first()).subscribe((result) => {
      if (result) {
        if (result.id)
          this.familyStore.updateFamily$({ id: result.id, dto: result.dto });
        else this.familyStore.createFamily$(result.dto);
      }
    });
  }

  viewFamilyDetails(family: FamilyModel) {
    const data: ModalFamilyDetailsInterface = { familyId: family.id };
    openResponsiveModal<ModalFamilyDetailsInterface, undefined>(
      this.mediaMatcher,
      this.matDialog,
      this.matBottomSheet,
      ModalFamilyDetailsComponent,
      data
    ).subscribe();
  }
}

interface FamilySearchFormInterface {
  search: FormControl<string | null>;
}

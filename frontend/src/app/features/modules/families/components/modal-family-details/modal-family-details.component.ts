import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FamilyModel } from '../../models/family.model';
import { ModalFamilyDetailsStore } from './modal-family.details.store';
import { AsyncPipe, NgIf, DatePipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-modal-family-details',
  templateUrl: './modal-family-details.component.html',
  styleUrls: ['./modal-family-details.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [ModalFamilyDetailsStore],
})
export class ModalFamilyDetailsComponent implements OnInit {
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public dataDialog: ModalFamilyDetailsInterface | null,

    @Optional()
    public dialogRef: MatDialogRef<ModalFamilyDetailsComponent>,

    @Optional()
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public dataBottomSheet: ModalFamilyDetailsInterface | null,

    @Optional()
    public bottomSheetRef: MatBottomSheetRef<ModalFamilyDetailsComponent>,
    private readonly store: ModalFamilyDetailsStore
  ) {
    this.familyId =
      this.dataDialog?.familyId || this.dataBottomSheet?.familyId || null;
  }

  familyId: string | null;
  family$ = this.store.family$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;

  ngOnInit() {
    if (this.familyId) this.store.fetch(this.familyId);
  }

  trackByChildId = (_: number, child: FamilyModel) => child.id;

  close() {
    this.dialogRef?.close();
    this.bottomSheetRef?.dismiss();
  }
}

export interface ModalFamilyDetailsInterface {
  familyId: string;
}

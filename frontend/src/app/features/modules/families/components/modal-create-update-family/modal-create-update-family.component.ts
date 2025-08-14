import { MediaMatcher } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FamilyModel } from '../../models/family.model';
import { CreateUpdateFamilyDto } from '../../dto/create-update-family.dto';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FamiliesSelectComponent } from 'app/shared/components/families-select/families-select.component';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-modal-create-update-family',
  templateUrl: './modal-create-update-family.component.html',
  styleUrls: ['./modal-create-update-family.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatDatepickerModule,
    FamiliesSelectComponent,
    NgxMaskDirective,
  ],
})
export class ModalCreateUpdateFamilyComponent {
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public dataDialog: ModalCreateUpdateFamilyInterface,

    @Optional()
    public dialogRef: MatDialogRef<ModalCreateUpdateFamilyComponent>,

    @Optional()
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public dataBottomSheet: ModalCreateUpdateFamilyInterface,

    @Optional()
    public bottomSheetRef: MatBottomSheetRef<ModalCreateUpdateFamilyComponent>,

    private readonly media: MediaMatcher
  ) {
    this.interface = dataDialog ?? dataBottomSheet;

    this.formGroup = this.createForm();
  }

  interface: ModalCreateUpdateFamilyInterface;

  formGroup: FormGroup<CreateUpdateFamilyFormInterface>;

  createForm() {
    const createdFormGroup = new FormGroup<CreateUpdateFamilyFormInterface>({
      name: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(120),
        ],
      }),
      birthDate: new FormControl<Date | null>(null, {
        nonNullable: true,
        validators: [
          Validators.required,
          (control) => {
            const value = control.value;
            if (!value) return null;
            const minDate = new Date('1900-01-01T00:00:00.000Z');
            return value < minDate ? { minDate: true } : null;
          },
          (control) => {
            const value = control.value;
            if (!value) return null;
            const maxDate = new Date();
            return value > maxDate ? { maxDate: true } : null;
          },
        ],
      }),
      document: new FormControl<string | null>(null, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      }),
      fatherId: new FormControl<string | null>(null, { nonNullable: true }),
      motherId: new FormControl<string | null>(null, { nonNullable: true }),
    });

    if (this.interface.family) {
      createdFormGroup.patchValue({
        name: this.interface.family.name,
        birthDate: this.interface.family.birthDate,
        document: this.interface.family.document,
        fatherId: this.interface.family.fatherId,
        motherId: this.interface.family.motherId,
      });
    }

    return createdFormGroup;
  }

  cancel(): void {
    this.closeDialog();
  }

  save(): void {
    if (this.formGroup.valid) {
      const dto: CreateUpdateFamilyDto = {
        name: this.formGroup.value.name!,
        birthDate: this.formGroup.value.birthDate!,
        document: this.formGroup.value.document!,
        fatherId: this.formGroup.value.fatherId ?? null,
        motherId: this.formGroup.value.motherId ?? null,
      };

      this.closeDialog({ id: this.interface.family?.id, dto });
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  private closeDialog(dto?: ModalCreateUpdateFamilyResponse): void {
    this.dialogRef?.close(dto);
    this.bottomSheetRef?.dismiss(dto);
  }
}

interface CreateUpdateFamilyFormInterface {
  name: FormControl<string | null>;
  birthDate: FormControl<Date | null>;
  document: FormControl<string | null>;
  fatherId: FormControl<string | null>;
  motherId: FormControl<string | null>;
}

export interface ModalCreateUpdateFamilyInterface {
  family?: FamilyModel;
}

export interface ModalCreateUpdateFamilyResponse {
  id?: string;
  dto: CreateUpdateFamilyDto;
}

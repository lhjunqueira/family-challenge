import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ModalFamilyDetailsComponent,
  ModalFamilyDetailsInterface,
} from './modal-family-details.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { ModalFamilyDetailsStore } from './modal-family.details.store';
import { FamiliesService } from '../../service/families.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

class FamiliesServiceMock {
  getFamilyById = jasmine.createSpy().and.returnValue(
    of({
      id: '1',
      name: 'N',
      birthDate: new Date(),
      document: '1',
      fatherId: null,
      motherId: null,
    })
  );
}
class DialogRefMock {
  close = jasmine.createSpy();
}
class BottomSheetRefMock {
  dismiss = jasmine.createSpy();
}

describe('ModalFamilyDetailsComponent', () => {
  let component: ModalFamilyDetailsComponent;
  let fixture: ComponentFixture<ModalFamilyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFamilyDetailsComponent, HttpClientTestingModule],
      providers: [
        ModalFamilyDetailsStore,
        { provide: FamiliesService, useClass: FamiliesServiceMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { familyId: '1' } as ModalFamilyDetailsInterface,
        },
        { provide: MatDialogRef, useClass: DialogRefMock },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: null },
        { provide: MatBottomSheetRef, useClass: BottomSheetRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalFamilyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load family', (done) => {
    component.family$.subscribe((f) => {
      if (f) {
        expect(f.id).toBe('1');
        done();
      }
    });
  });

  it('close should close dialog/bottomSheet if present', () => {
    component.close();
    const dialogRef = TestBed.inject(MatDialogRef);
    expect((dialogRef as any).close).toHaveBeenCalled();
  });
});

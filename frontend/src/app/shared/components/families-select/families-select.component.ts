import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { FamiliesSelectStore } from './families-select.store';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'families-select',
  templateUrl: './families-select.component.html',
  styleUrls: ['./families-select.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AsyncPipe,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [FamiliesSelectStore],
})
export class FamiliesSelectComponent
  implements ControlValueAccessor, Validator, OnDestroy, AfterViewInit, OnInit
{
  constructor(
    @Self() @Optional() private ngControl: NgControl,
    private readonly cdRef: ChangeDetectorRef,
    private readonly familiesStore: FamiliesSelectStore
  ) {
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  @Input() label = 'Family';
  @Input({ required: true }) formControl: FormControl<string | null> | null =
    null;
  destroy$ = new Subject<void>();
  families$ = this.familiesStore.families$;
  loading$ = this.familiesStore.loading$;

  private _onTouch!: () => void;
  private _onChange: (value: string) => void = () => {};
  private familiesSnapshot: { id: string; name: string }[] = [];
  searchControl = new FormControl<string>('', { nonNullable: true });

  ngOnInit(): void {
    this.formControl = this.formControl ?? new FormControl<string | null>(null);
    this.familiesStore.fetch();

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        const term = (value ?? '').trim();
        this.familiesStore.fetch(term);
      });

    this.families$.pipe(takeUntil(this.destroy$)).subscribe((list) => {
      this.familiesSnapshot = list.map((f) => ({ id: f.id, name: f.name }));
      this.syncDisplayedName();
    });
  }

  writeValue(value: string): void {
    if (value !== this.formControl?.value) this.formControl?.setValue(value);
    this.syncDisplayedName();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouch = fn;
  }

  validate(): ValidationErrors | null {
    return this.formControl?.valid ? null : { required: true };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
    this.formControl = this.ngControl?.control as FormControl<string>;
    this.syncDisplayedName();
  }

  onOptionSelected(id: string) {
    if (this.formControl?.value !== id) {
      this.formControl?.setValue(id);
      this._onChange(id);
    }
    this.syncDisplayedName();
  }

  clearSelection() {
    this.formControl?.setValue(null as any);
    this._onChange(null as any);
    this.searchControl.setValue('', { emitEvent: true });
  }

  private syncDisplayedName() {
    const id = this.formControl?.value;
    if (!id) return;
    const match = this.familiesSnapshot.find((f) => f.id === id);
    if (match && this.searchControl.value !== match.name) {
      this.searchControl.setValue(match.name, { emitEvent: false });
    }
  }
}

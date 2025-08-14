import { MediaMatcher } from '@angular/cdk/layout';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

// Abre dialog ou bottom sheet conforme breakpoint.
export function openResponsiveModal<T, R = any>(
  media: MediaMatcher,
  dialog: MatDialog,
  bottomSheet: MatBottomSheet,
  component: any,
  data?: T,
  breakpoint = '(max-width: 600px)',
  dialogConfig: MatDialogConfig = {},
  sheetConfig: MatBottomSheetConfig = {}
): Observable<R | undefined> {
  if (media.matchMedia(breakpoint).matches) {
    return bottomSheet
      .open(component, { data, ...sheetConfig })
      .afterDismissed();
  }
  return dialog.open(component, { data, ...dialogConfig }).afterClosed();
}

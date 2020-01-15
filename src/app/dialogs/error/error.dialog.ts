import { Component, ChangeDetectionStrategy, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: 'mix-error',
  templateUrl: 'error.dialog.html',
  styleUrls: ['./error.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorDialog {

  constructor(
    public dialogRef: MatDialogRef<ErrorDialog>,
    @Inject(MAT_DIALOG_DATA) public error: HttpErrorResponse
  ) {
    // Check for Offline status
    // First possible: User has connection problems and can't access MIX
    // Second possible: User has deactivated internet
    this.offline = (!this.error.ok && this.error.status == 0) || !navigator.onLine
  }

  offline = false

}
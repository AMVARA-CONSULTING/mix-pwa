import { Component, ChangeDetectionStrategy, Inject, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiService } from "@services/api.service";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'mix-feedback',
  templateUrl: 'feedback.dialog.html',
  styleUrls: ['./feedback.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedbackDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FeedbackDialog>,
    private _fb: FormBuilder,
    private _api: ApiService,
    private _snack: MatSnackBar,
    private _cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.feedbackForm = this._fb.group({
      liked: [''],
      different: [''],
      what: [''],
      suggestion: [''],
      contact: [false, Validators.compose([Validators.required, Validators.requiredTrue])],
      name: [''],
      telefon: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      captcha: ['']
    })
    this.feedbackForm.get('telefon')
  }

  captcha_required = new BehaviorSubject<boolean>(false)

  feedbackForm: FormGroup

  ngOnInit() {
    this._api.getCaptcha().subscribe(captcha => {
      if (captcha.required) {
        this.feedbackForm.get('captcha').setValidators([Validators.required])
      } else {
        this.feedbackForm.get('captcha').setValidators([])
      }
      this.feedbackForm.updateValueAndValidity()
      this.captcha_required.next(captcha.required)
    })
    setTimeout(_ => window.scrollTo(0, 1))
  }
  
  handleCaptcha(event) {
    this._cdr.markForCheck()
  }

  sending = new BehaviorSubject<boolean>(false)

  send() {
    this.sending.next(true)
    const form = new FormData()
    const values = this.feedbackForm.value
    for (let key in values) {
      form.append(key, values[key])
    }
    this._api.sendFeedback(form).subscribe(res => {
      if (res.success) {
        this._snack.open('Deine Nachricht wurde verschickt. Wir danken Dir für Deine Zeit und Deine Hilfe.', 'OK', { duration: 5000, verticalPosition: 'top' })
        this.dialogRef.close(true)
      } else {
        this._snack.open('Error', 'OK', { duration: 3000 })
      }
    },
    err => {},
    () => this.sending.next(false))
  }

}
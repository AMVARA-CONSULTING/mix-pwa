import { Component, OnInit, HostListener, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { SubSink } from '@services/tools.service';

@Component({
  selector: 'app-mediadaten',
  templateUrl: './mediadaten.component.html',
  styleUrls: ['../kontaktformular/kontaktformular.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediadatenComponent implements OnInit, OnDestroy {

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  _subs = new SubSink()

  form: FormGroup;
  name = new FormControl("", Validators.required);
  contact = new FormControl("", Validators.compose([Validators.required, Validators.email]));
  text = new FormControl("", Validators.required);
  agree = new FormControl(false, Validators.requiredTrue);
  telefon = new FormControl("", Validators.required);
  captcha = new FormControl("");
  plzort = new FormControl("");
  strasse = new FormControl("");
  name_error: boolean = false;
  email_error: boolean = false;
  agree_error: boolean = false;
  text_error: boolean = false;
  telefon_error: boolean = false;
  captcha_error: boolean = false;
  plzort_error: boolean = false;
  strasse_error: boolean = false;
  form_mode: boolean = true;
  maximum_col
  screenHeight
  screenWidth
  columns
  animation_check
  captcha_required = new BehaviorSubject<boolean>(false)
  data$: any[] = []
  alert = new BehaviorSubject<boolean>(false)
  error_alert = false;
  message_alert = new BehaviorSubject<string>('')
  hover_cap = false;
  pre_alert_message = new BehaviorSubject<string>('')
  open: boolean = true;

  @Output() status: EventEmitter<any> = new EventEmitter<any>();

  passMail() {
    this.open = false;
    this.status.emit(this.open);
  }
  constructor(
    private _fb: FormBuilder,
    private api: ApiService,
    public globals: GlobalsService,
    public router: Router,
    private _translate: TranslateService
  ) {
    this.form = this._fb.group({
      "name": this.name,
      "email": this.contact,
      "text": this.text,
      "telefon": this.telefon,
      "captcha": this.captcha,
      "strasse": this.strasse,
      "plzort": this.plzort,
      "agree": this.agree
    })
  }

  ngOnInit() {
    this.onResize()
    this._subs.sink = this.api.getCaptcha().subscribe(captcha => {
      if (captcha.required) {
        this.captcha.setValidators([Validators.required])
      } else {
        this.captcha.setValidators([])
      }
      this.captcha.updateValueAndValidity()
      this.captcha_required.next(captcha.required)
    }, err => {
      this.pre_alert_message.next('MIX für ungut!')
      this.message_alert.next(this._translate.instant('aufgeben.error_request'))
      this.alert.next(true)
    })
  }

  @HostListener('window:resize') onResize() {
    this.maximum_col = 3
    this.screenHeight = window.innerHeight
    this.screenWidth = window.innerWidth
    this.columns = 1
    this.animation_check = 'nothing'
    if (this.screenWidth >= 860) {
      this.columns = 2
      this.animation_check = 'app'
    }
    if (this.screenWidth >= 1260) {
      this.columns = 3
      this.animation_check = 'app'
    }
    if (this.columns > this.maximum_col) this.columns = this.maximum_col
    if (this.globals.checkSafari()) this.columns = 1

  }
  checkForm() {
    this.message_alert.next("")
    let fields = []
    if (this.name.invalid) {
      fields.push(this._translate.instant('mediadaten.namefirma'))
      this.name_error = true;
    }
    if (this.contact.invalid) {
      fields.push(this._translate.instant('mediadaten.email'))
      this.email_error = true;
    }
    if (this.telefon.invalid) {
      fields.push(this._translate.instant('mediadaten.telefon'))
      this.telefon_error = true;
    }
    try {
      const validator = this.captcha.validator({} as AbstractControl);
      if (validator && validator.required && this.captcha.invalid) {
        fields.push(this._translate.instant('mediadaten.captcha'))
        this.captcha_error = true
      }
    } catch (err) {  }
    if (this.agree.invalid) {
      fields.push(this._translate.instant('mediadaten.agree'))
      this.agree_error = true;
    }
    if (fields.length === 0) {
      this.waiting = true
      this.sendForm()
    } else {
      this.pre_alert_message.next("MIX für ungut!")
      this.message_alert.next(`Unsere Programmierung hat festgestellt, dass noch Informationen fehlen. Bitte fülle folgende Felder aus: ${fields.join(', ')}`)
      this.alert.next(true)
    }

  }

  exit = false
  waiting = false

  sendForm() {
    var form = new FormData()
    form.append('name', this.form.value.name)
    form.append('telefon', this.form.value.telefon)
    form.append('text', this.form.value.text)
    form.append('email', this.form.value.email)
    form.append('strasse', this.form.value.strasse)
    form.append('plzort', this.form.value.plzort)
    form.append('mode', "mediadaten")
    this._subs.sink = this.api.sendKontaktformular(form).subscribe( data => {
      if (data == null) {
        this.waiting = true
        this.pre_alert_message.next("MIX für ungut!")
        this.message_alert.next(this._translate.instant('aufgeben.error_request'))
        this.alert.next(true)
      } else {
        if (data[1].response == 'ok') {
          this.waiting = true
          this.pre_alert_message.next("Vielen Dank!")
          this.message_alert.next("Wir haben Deine eMail erhalten und kümmern uns darum.")
          this.alert.next(true)
          this.exit = true;
        } else {
          this.alert.next(true)
          this.waiting = true
          this.pre_alert_message.next("MIX für ungut!")
          this.message_alert.next(this._translate.instant('aufgeben.error_request'))
        }
      }
    })
  }
  onSwipeRight($event) {
    if ($event.pointerType == "touch") {
      this.router.navigate(['/datenschutz'])
    }
  }
  onSwipeLeft($event) {
    if ($event.pointerType == "touch") {
      this.router.navigate(["/termine"])
    }
  }
}

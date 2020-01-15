import { Component, OnInit, HostListener, Output, EventEmitter, ChangeDetectionStrategy, Input, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { debounce } from 'app/decorators/debounce';
import { SubSink } from '@services/tools.service';

@Component({
  selector: 'mix-kontaktformular',
  templateUrl: './kontaktformular.component.html',
  styleUrls: ['./kontaktformular.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KontaktformularComponent implements OnInit, OnDestroy {

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  _subs = new SubSink()

  form: FormGroup;
  name = new FormControl("", Validators.required);
  contact = new FormControl("", Validators.required);
  text = new FormControl("", Validators.required);
  telefon = new FormControl("", Validators.required);
  captcha = new FormControl("");
  agree = new FormControl(false, Validators.requiredTrue);
  name_error = new BehaviorSubject<boolean>(false)
  email_error = new BehaviorSubject<boolean>(false)
  text_error = new BehaviorSubject<boolean>(false)
  telefon_error = new BehaviorSubject<boolean>(false)
  captcha_error = new BehaviorSubject<boolean>(false)
  agree_error = new BehaviorSubject<boolean>(false)
  form_mode = new BehaviorSubject<boolean>(true)
  captcha_required = new BehaviorSubject<boolean>(false)
  maximum_col
  screenWidth
  columns = new BehaviorSubject<number>(2)
  alert = new BehaviorSubject<boolean>(false)
  error_alert = false;
  message_alert = new BehaviorSubject<string>('')
  hover_cap = false;
  pre_alert_message = new BehaviorSubject<string>('')
  open: boolean = true;

  @Output() status: EventEmitter<any> = new EventEmitter<any>()
  @Input() email: string

  passMail() {
    this.open = false;
    this.status.emit(this.open);
  }
  constructor(
    private _fb: FormBuilder,
    private api: ApiService,
    public globals: GlobalsService,
    public _translate: TranslateService
  ) {
    this.form = this._fb.group({
      "name": this.name,
      "email": this.contact,
      "text": this.text,
      "telefon": this.telefon,
      "captcha": this.captcha,
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

  @HostListener('window:resize')
  @debounce(300)
  onResize() {
    this.maximum_col = 3
    this.screenWidth = window.innerWidth
    if (this.screenWidth >= 1200) {
      this.columns.next(3)
    } else if (this.screenWidth >= 760) {
      this.columns.next(2)
    } else {
      this.columns.next(1)
    }
    if (this.columns > this.maximum_col) {
      this.columns = this.maximum_col
    }
    if (this.globals.checkSafari() == true) this.columns.next(1)

  }
  checkForm() {
    let fields = []
    if (this.name.invalid) {
      fields.push(this._translate.instant('mediadaten.namefirma'))
      this.name_error.next(true)
    }
    if (this.contact.invalid) {
      fields.push(this._translate.instant('mediadaten.email'))
      this.email_error.next(true)
    }
    if (this.telefon.invalid) {
      fields.push(this._translate.instant('mediadaten.telefon'))
      this.telefon_error.next(true)
    }
    if (this.text.invalid) {
      fields.push(this._translate.instant('mediadaten.textareamsgtitle'))
      this.text_error.next(true)
    }
    if (this.agree.invalid) {
      fields.push(this._translate.instant('mediadaten.agree'))
      this.agree_error.next(true)
    }
    try {
      const validator = this.captcha.validator({} as AbstractControl);
      if (validator && validator.required && this.captcha.invalid) {
        fields.push(this._translate.instant('mediadaten.captcha'))
        this.captcha_error.next(true)
      }
    } catch (err) { }
    if (fields.length === 0) {
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
    form.append('recipient', this.email)
    form.append('mode', "kontakt")
    this._subs.sink = this.api.sendKontaktformular(form).subscribe( data => {
      if (data == null) {
        this.waiting = true
        this.pre_alert_message.next("MIX für ungut!")
        this.message_alert.next(this._translate.instant('aufgeben.error_request'))
        this.alert.next(true)
      } else {
        if (data[1]['response'] == 'ok') {
          this.waiting = true
          this.pre_alert_message.next("Vielen Dank!")
          this.message_alert.next("Wir haben Deine eMail erhalten und kümmern uns darum.")
          this.alert.next(true)
          this.exit = true
        } else {
          this.alert.next(true)
          this.waiting = true
          this.pre_alert_message.next("MIX für ungut!")
          this.message_alert.next(this._translate.instant('aufgeben.error_request'))
        }
      }
    })
  }
  @HostListener('window:popstate') onBack() {
    this.passMail()
  }

  backHistory() {
    window.history.back()
  }
}

import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ViewChild, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { Router } from '@angular/router';
import { GlobalsService } from '@services/globals.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent, MatDatepicker } from '@angular/material/datepicker'
import { Subscription, forkJoin } from 'rxjs';
import { ToolsService, safeGetStorageItem, safeSetStorageItem, SubSink } from '@services/tools.service';
import { InfoService } from '@services/info.service';
import { API_URL } from 'app/tokens';
import { map } from 'rxjs/internal/operators/map';

declare const moment, $: any

@Component({
  selector: 'app-aufgeben-termine',
  templateUrl: './aufgeben-termine.component.html',
  host: {
    '(document:click)': 'handleClick($event)',
  },
  styleUrls: ['./aufgeben-termine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AufgebenTermineComponent implements OnInit, AfterViewInit, OnDestroy {
  sessionid = new BehaviorSubject<string>('')

  sending_form = new BehaviorSubject<boolean>(false)

  ngAfterViewInit() {
    window.scrollTo(0, 0)
  }

  _subs = new SubSink()

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  vorname = new FormControl("", Validators.compose([Validators.required, Validators.minLength(2)]))
  vorname_error: boolean = false
  nachname = new FormControl("", Validators.compose([Validators.required, Validators.minLength(2)]))
  nachname_error: boolean = false
  firma = new FormControl("", Validators.compose([Validators.required, Validators.minLength(2)]))
  vorwahl = new FormControl("", Validators.compose([Validators.required, Validators.minLength(3), Validators.pattern(/[0-9]*/g)]))
  vorwahl_error: boolean = false
  telefonnummer = new FormControl("", Validators.compose([Validators.required, Validators.minLength(2)]))
  telefonnummer_error: boolean = false
  email = new FormControl("", Validators.compose([Validators.required, Validators.email]))
  email_error: boolean = false
  kunde_typ = new FormControl("", Validators.compose([Validators.required, Validators.minLength(1)]))
  kunde_typ_error: boolean = false
  max_file_size: number = 3145728
  image_cont: number = 0

  rubrik = new FormControl("", Validators.compose([Validators.required, Validators.minLength(1)]))
  rubrik_error: boolean = false
  rubrik_list_string = new BehaviorSubject<string>('')
  titel = new FormControl("", Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(100)]))
  titel_error: boolean = false
  kurzebeschreibung = new FormControl("")
  kurzebeschreibung_error: boolean = false
  ausstellungen_opening_hours = new FormControl("", Validators.compose([Validators.required, Validators.minLength(3)]))
  ausstellungen_opening_hours_error: boolean = false
  beginn = new FormControl("", Validators.compose([Validators.required, Validators.pattern(/([0-1][0-9]|2[0-3]):[0-5][0-9]/g)]))
  beginn_error: boolean = false
  datum = new FormControl("", Validators.required)
  datum_error: boolean = false

  datum_string: string = ""
  veranstaltungsort = new FormControl("", Validators.compose([Validators.required, Validators.minLength(1)]))
  veranstaltungsort_error: boolean = false
  region = new FormControl("")
  region_error: boolean = false
  strasse = new FormControl("", Validators.required)
  strasse_error: boolean = false
  plz = new FormControl("", Validators.required)
  plz_error: boolean = false
  ort = new FormControl("", Validators.required)
  ort_error: boolean = false
  ver_vorwahl = new FormControl("")
  ver_vorwahl_error: boolean = false
  ver_telefonnummer = new FormControl("")
  ver_telefonnummer_error: boolean = false
  homepage = new FormControl("", Validators.required)
  homepage_error: boolean = false
  ver_email = new FormControl("", Validators.required)
  ver_email_error: boolean = false

  image = new FormControl("ja", Validators.required)
  image_radio_error: boolean = false
  copyright = new FormControl(false, Validators.required)
  copyright_error: boolean = false
  text = new FormControl("ja", Validators.required)
  text_radio_error: boolean = false

  mandat_id = new BehaviorSubject<string>('')

  nachricht = new FormControl("", Validators.required)
  nachricht_error: boolean = false

  kunde_kto_inhaber = new FormControl("", Validators.compose([Validators.required, Validators.minLength(4)]))
  kunde_kto_inhaber_error: boolean = false
  kunde_kto_inhaber2 = new FormControl("", Validators.compose([Validators.required, Validators.minLength(4)]))
  kunde_kto_inhaber2_error: boolean = false
  kunde_kto_firma = new FormControl("", Validators.compose([Validators.required]))
  kunde_kto_firma_error: boolean = false
  kunde_kto_strasse = new FormControl("", Validators.compose([Validators.required, Validators.minLength(3)]))
  kunde_kto_strasse_error: boolean = false
  kunde_kto_plz = new FormControl("", Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)]))
  kunde_kto_plz_error: boolean = false
  kunde_kto_ort = new FormControl("", Validators.compose([Validators.required, Validators.minLength(3)]))
  kunde_kto_ort_error: boolean = false
  rechnung = new FormControl("Nein", Validators.required)
  rechnung_error: boolean = false
  zahlung_per = new FormControl("", Validators.required)
  zahlung_per_error: boolean = false
  kontoinhaber = new FormControl("", Validators.compose([Validators.required, Validators.minLength(4)]))
  kontoinhaber_error: boolean = false
  iban = new FormControl("", Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z]{2}[0-9]{2}\s?[a-zA-Z0-9]{4}\s?[0-9]{4}\s?[0-9]{3}([a-zA-Z0-9]\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,3})?$/)]))
  iban_error: boolean = false
  form_privacy = new FormControl(false, Validators.required)
  form_privacy_error: boolean = false
  form_terms = new FormControl(false, Validators.required)
  form_terms_error: boolean = false
  austellungen_start = new FormControl('', Validators.required)
  austellungen_start_error = false
  austellungen_end = new FormControl('', Validators.required)
  austellungen_end_error = false
  austellungen_schedule = new FormControl('', Validators.required)
  austellungen_schedule_error = false
  rubrik_list_open: boolean = false

  form: FormGroup
  final_date$ = new BehaviorSubject<string>('')
  constructor(
    public translate: TranslateService,
    private _fb: FormBuilder,
    public api: ApiService,
    public globals: GlobalsService,
    public router: Router,
    private _sanitizer: DomSanitizer,
    private _snack: MatSnackBar,
    private _tools: ToolsService,
    public _info: InfoService,
		@Inject(API_URL) private api_url: string
  ) {
    this._subs.sink = this.rubrik_list_string.subscribe(_ => this.rubrik_error = false)
    // Check if Aufgeben is available, also checking if info is loaded, if not, wait for it
    if (!this._info.serverInfo.aufgeben_form_status) this.showAufgebenDisabled.next(true)
    this.form = this._fb.group({
      "vorname": this.vorname,
      "nachname": this.nachname,
      "firma": this.firma,
      "vorwahl": this.vorwahl,
      "telefonnummer": this.telefonnummer,
      "email": this.email,
      "kunde_typ": this.kunde_typ,
      "rubrik": this.rubrik,
      "titel": this.titel,
      "form_privacy": this.form_privacy,
      "form_terms": this.form_terms,
      "kurzebeschreibung": this.kurzebeschreibung,
      "beginn": this.beginn,
      "datum": this.datum,
      "austellungen_start": this.austellungen_start,
      "austellungen_end": this.austellungen_end,
      "austellungen_schedule": this.austellungen_schedule,
      "veranstaltungsort": this.veranstaltungsort,
      "region": this.region,
      "ausstellungen_opening_hours": this.ausstellungen_opening_hours,
      "strasse": this.strasse,
      "plz": this.plz,
      "ort": this.ort,
      "ver_vorwahl": this.ver_vorwahl,
      "ver_telefonnummer": this.ver_telefonnummer,
      "homepage": this.homepage,
      "ver_email": this.ver_email,
      "nachricht": this.nachricht.asyncValidator,
      "image": this.image,
      "text": this.text,
      "copyright": this.copyright,
      "kunde_kto_inhaber": this.kunde_kto_inhaber,
      "kunde_kto_inhaber2": this.kunde_kto_inhaber2,
      "kunde_kto_firma": this.kunde_kto_firma,
      "kunde_kto_strasse": this.kunde_kto_strasse,
      "kunde_kto_plz": this.kunde_kto_plz,
      "kunde_kto_ort": this.kunde_kto_ort,
      "rechnung": this.rechnung,
      "zahlung_per": this.zahlung_per,
      "kontoinhaber": this.kontoinhaber,
      "iban": this.iban
    })
    this._subs.sink = this.iban.valueChanges.pipe(
			map(iban => iban.replace(/\s+/g, '').toUpperCase().substr(0, 32)),
			map(iban => iban.match(/.{1,4}/g))
		).subscribe((numbers: any[]) => this.iban.setValue(numbers.join(' '), { emitEvent: false }))
  }

  @ViewChild('picker', { static: false }) datePicker: MatDatepicker<any>

  openPicker(): void {
    this.datePicker.open()
  }

  exit_alert = new BehaviorSubject<boolean>(false)
  confirm_alert = new BehaviorSubject<boolean>(false)
  abbuchung$ = new BehaviorSubject<string>('')
  orte_list = new BehaviorSubject<any[]>([])
  orte_list_show = new BehaviorSubject<boolean>(false)
  ngOnInit() {
    this._subs.sink = this.api.getAufgebenOrte().subscribe( data => this.orte_list.next(data) )
    this._subs.sink = this.api.getAbbuchungsTermine().subscribe( data => {
      this.final_date$.next(this._info.serverInfo.termin_coupon_hinweis_text)
      this.checkError(data['status'])
    })
    const storageValues = ['vorname', 'nachname', 'firma', 'vorwahl', 'telefonnummer', 'email', 'kunde_typ', 'kunde_kto_inhaber', 'kunde_kto_inhaber2', 'kunde_kto_strasse', 'kunde_kto_plz', 'kunde_kto_ort', 'kontoinhaber', 'kunde_kto_firma', 'rechnung', 'zahlung_per']
    for (let value of storageValues) {
      if (safeGetStorageItem(value)) {
        this[value].setValue(safeGetStorageItem(value))
      }
    }
  }

  dateArraySubscription: Subscription
  rubrikSubscription: Subscription

  checkError(subject: string) {
    if (subject.startsWith("EX-DB-") == true) {
      // alert box if backend has disabled termine aufgeben
      this.exit_alert.next(true)

      // redirect to main landing
      // FIXME ... XXX

    }

  }

  showAufgebenDisabled = new BehaviorSubject<boolean>(false)

  checkAbbuchung() {
    if (this.form.value.zahlung_per != 'lastschrift') {
      this.sendForm()
    }
  }

  minDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]

  checkPage(n) {
    var form = this.form.value
    var message = false
    let fields = []
    if (n == 1) {
      if (this.vorname.invalid) {
        fields.push('Vorname')
        message = true
        this.vorname_error = true
      } else {
        safeSetStorageItem('vorname', this.vorname.value)
      }
      safeSetStorageItem('firma', this.firma.value)
      if (this.nachname.invalid) {
        fields.push('Nachname')
        message = true
        this.nachname_error = true
      } else {
        safeSetStorageItem('nachname', this.nachname.value)
      }
      if (this.vorwahl.invalid) {
        fields.push('Vorwahl')
        message = true
        this.vorwahl_error = true
      } else {
        safeSetStorageItem('vorwahl', this.vorwahl.value)
      }
      if (this.telefonnummer.invalid) {
        fields.push('Telefonnummer')
        message = true
        this.telefonnummer_error = true
      } else {
        safeSetStorageItem('telefonnummer', this.telefonnummer.value)
      }
      this.email.setValue(this.email.value.replace(/ /g, ''))
      if (this.email.invalid) {
        fields.push('eMail')
        message = true
        this.email_error = true
      } else {
        safeSetStorageItem('email', this.email.value)
      }
      if (this.kunde_typ.invalid) {
        fields.push('Kunde Type')
        message = true
        this.kunde_typ_error = true
      } else {
        safeSetStorageItem('kunde_typ', this.kunde_typ.value)
      }
      if (message) {
        this.scrollToError()
        for (let field of fields) {
          fields[fields.indexOf(field)] = this.translate.instant("aufgeben.termine." + field.toLowerCase().replace(/\ /g, '_'))
        }
        this.showAlert("MIX für ungut!", this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', '))
        return false
      }
      else {
        return true
      }
    }
    if (n == 2) {
      this.final_price = this._tools.getTotalTerminePrice(this.titel.value, this.kurzebeschreibung.value, this.date_array.getValue())
      if (this.rubrik_list_string.getValue() === '') {
        this.rubrik_error = true
        message = true
        fields.push(this.translate.instant("aufgeben.termine.rubrik"))
      }
      if (this.titel.invalid) {
        // fields.push('Titel')
        message = true
        this.titel_error = true
      }
      if (!this._tools.mixCamelCase(this.titel.value)) {
        fields.push(this.translate.instant("aufgeben.termine.titelcamelcase"))
        message = true
      }
      if (this.rubrik_list_string.getValue() != 'Ausstellungen') {
        if (this.beginn.invalid) {
          message = true
          this.beginn_error = true
          fields.push(this.translate.instant("aufgeben.termine.beginn"))
        }
        const dates = this.date_array.getValue()
        if (this.date_array.getValue().length > 0) {
          for (let date of dates) {
            const parsed = moment(date, 'DD.MM.YYYY')
            if (moment().diff(parsed, 'days') > 0) {
              message = true
              this.datum_error = true
              fields.push(this.translate.instant("aufgeben.termine.olddate"))
            }
          }
        } else {
          // dates_array should have values if rubrik is not austellungen
          message = true
          this.datum_error = true
          fields.push(this.translate.instant("aufgeben.termine.datum"))
        }

      } else {
        if (this.ausstellungen_opening_hours.invalid) {
          // dates_array should have values if rubrik is not austellungen
          message = true
          this.datum_error = true
        }
      }
      this.checkFree()
      if (this.free.getValue()) {
        if (this.kurzebeschreibung.value.length > 500) {
          // TODO fixme
          // message=this.translate.instant("aufgeben.error_kurzebeschreibung_length")+"<br>"
          message = true
          this.kurzebeschreibung_error = true
          // fields.push(this.translate.instant("aufgeben.termine.kurze_beschreibung_100chars"))
        }
      }
      if (this.veranstaltungsort.invalid) {
        message = true
        this.veranstaltungsort_error = true
        fields.push(this.translate.instant("aufgeben.termine.veranstaltungsort"))
      }
      if (this.rubrik_list_string.getValue() === 'Ausstellungen') {
        // commented as being and end datum is has been replaced with textarea
        // if (this.austellungen_start.value.length === 0 || this.austellungen_end.value.length === 0 || this.austellungen_schedule.value.length === 0) {
        //   fields.push('Ausstellungen')
        //   message = true
        //   this.austellungen_start_error = true
        //   this.austellungen_end_error = true
        //   this.austellungen_schedule_error = true
        // }
      }
      /* if (form.region == '') {
        fields.push('Region')
        message = true
        this.region_error = true
      } */
      if (form.strasse == '') {
        message = true
        this.strasse_error = true
        fields.push(this.translate.instant("aufgeben.termine.strasse"))
      }
      if (form.ort == '') {
        message = true
        this.ort_error = true
        fields.push(this.translate.instant("aufgeben.termine.ort"))
      }
      if (form.plz == '') {
        message = true
        this.plz_error = true
        fields.push(this.translate.instant("aufgeben.termine.plz"))
      }
      if (message) {
        this.scrollToError()
        this._tools.alert("MIX für ungut!", this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', '), '', 'OK')
        return false
      }
      else {
        return true
      }
    }
    if (n == 3) {
      if (form.image == '') {
        fields.push('Image')
        message = true
        this.image_radio_error = true
      }
      if (form.text == '') {
        fields.push('Text')
        message = true
        this.text_radio_error = true
      }
      if ((this.file_images.getValue().length > 0 || this.file_text.getValue().length > 0) && !this.copyright.value) {
        fields.push('Copyright')
        message = true
        this.copyright_error = true
        this.scrollToError()
        for (let field of fields) {
          fields[fields.indexOf(field)] = this.translate.instant("aufgeben.termine." + field.toLowerCase().replace(/\ /g, '_'))
        }
        this.showAlert("MIX für ungut!", this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', '))
        return false
      }
      if (this.file_text.getValue().length > 5) {
        fields.push('TooManyTextes')
        message = true
        this.text_radio_error = true
      }
      if ((form.image == 'ja') && (this.file_images.getValue().length > 5)) {
        // TODO fixme
        // message=message+"Maximal 5 Bilder.<br>"
        fields.push('Maximal 5 Bilder')
        message = true
        this.image_radio_error = true
      }
      if (message) {
        this.scrollToError()
        for (let field of fields) {
          fields[fields.indexOf(field)] = this.translate.instant("aufgeben.termine." + field.toLowerCase().replace(/\ /g, '_'))
        }
        this.showAlert("MIX für ungut!", this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', '))
        return false
      }
      else {
        return true
      }
    }
    if (n == 4) {
      if (this.free.getValue()) return true
      safeSetStorageItem('kunde_kto_firma', this.kunde_kto_firma.value)
      safeSetStorageItem('rechnung', this.rechnung.value)
      safeSetStorageItem('zahlung_per', this.zahlung_per.value)

      // Rechnung is always necessary for taxes
      if (this.kunde_kto_inhaber.invalid) {
        fields.push('Vorname')
        message = true
        this.kunde_kto_inhaber_error = true
      } else {
        safeSetStorageItem('kunde_kto_inhaber', this.kunde_kto_inhaber.value)
      }
      if (this.kunde_kto_inhaber2.invalid) {
        fields.push('Nachname')
        message = true
        this.kunde_kto_inhaber2_error = true
      } else {
        safeSetStorageItem('kunde_kto_inhaber2', this.kunde_kto_inhaber2.value)
      }
      if (this.kunde_kto_strasse.invalid) {
        fields.push('Strasse')
        message = true
        this.kunde_kto_strasse_error = true
      } else {
        safeSetStorageItem('kunde_kto_strasse', this.kunde_kto_strasse.value)
      }
      if (this.kunde_kto_plz.invalid) {
        fields.push('Plz')
        message = true
        this.kunde_kto_plz_error = true
      } else {
        safeSetStorageItem('kunde_kto_plz', this.kunde_kto_plz.value)
      }
      if (this.kunde_kto_ort.invalid) {
        fields.push('Ort')
        message = true
        this.kunde_kto_ort_error = true
      } else {
        safeSetStorageItem('kunde_kto_ort', this.kunde_kto_ort.value)
      }

      // Some other logic checks
      if (['Ja', 'Nein'].indexOf(form.rechnung) === -1) {
        fields.push('Rechnung')
        message = true
        this.rechnung_error = true
      }
      if (this.zahlung_per.invalid) {
        fields.push('Zahlung')
        message = true
        this.zahlung_per_error = true
      }
      if (form.zahlung_per == 'lastschrift') {
        if (this.kontoinhaber.invalid) {
          fields.push('Inhaber2')
          message = true
          this.kontoinhaber_error = true
        } else {
          safeSetStorageItem('kontoinhaber', this.kontoinhaber.value)
        }
        if (this.iban.invalid) {
          fields.push('IBAN')
          message = true
          this.iban_error = true
        } else {
          if (this.iban.value.substring(0, 2) == 'DE' && this.iban.value.replace(/\ /g, '').length != 22) {
            fields.push('IBAN_format')
            message = true
            this.iban_error = true
          } else {
            const temp_iban = this.iban.value.toUpperCase().replace(/\ /g, '')
            var text_temp = ''
            for (let i = 0; i < temp_iban.length;) {
              text_temp += temp_iban.substr(i, 4) + " "
              i = i + 4
            }
            this.iban.setValue(text_temp)
          }
        }
      }
    }
    if (message) {
      this.scrollToError()
      for (let field of fields) {
        fields[fields.indexOf(field)] = this.translate.instant(`aufgeben.termine.${field.toLowerCase()}`)
      }
      this.showAlert("MIX für ungut!", this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', '))
    }
    else {
      return true
    }

  }

  public beginnMask = [/\d/, /\d/, ':', /\d/, /\d/]

  waiting = new BehaviorSubject<boolean>(false)
  alert = new BehaviorSubject<boolean>(false)
  pre_alert_message = new BehaviorSubject<string>('')
  message_alert = new BehaviorSubject<string>('')
  simple_alert = new BehaviorSubject<boolean>(false)

  /**
   * Function executes, when user click auf similiarAufgeben at the end of form
   * It checks if the localStorage Cookie agreement is there and denies
   * further similiar aufgeben, if not present
   * 
   */
  clickedSimiliarNewAufgeben() {
    // when clicking SimiliarAufgeben ... then check if cookies are agreed
    if (!(safeGetStorageItem('cookies') === 'agree')) {
      this.showAlert(
        this.translate.instant("aufgeben.termine.errmsg_cookies_pre"),
        this.translate.instant("aufgeben.termine.errmsg_cookies_msg")
      )
      // change the cookieObserver to provoke newly cookieWindow to be shown
      this.globals.cookiesObserver.next(!this.globals.cookiesObserver.getValue());
      this.page.next(1)
      this.beginn.setValue('')
      this.date_array.next([])
    } else {
      this.page.next(2)
      this.beginn.setValue('')
      this.date_array.next([])
      this.vielen_dank.next(false);
    }
  }

  /**
   * Shows a modal with two alert messages, one is pre on the top and the long msg below
   * @param pre_alert 
   * @param message 
   */
  showAlert(pre_alert, message) {
    this.alert.next(true)
    this.pre_alert_message.next(pre_alert)
    this.message_alert.next(message)
    this.waiting.next(true)
  }
  removeAlert() {
    this.alert.next(false)
    this.simple_alert.next(false)
    this.disable_form.next(false)
    this.pre_alert_message.next('')
    this.message_alert.next('')
    this.waiting.next(false)
  }
  scrollToError() {
    setTimeout(() => {
      var reference = document.getElementsByClassName("error_reference");
      reference[0].scrollIntoView({ block: "center", behavior: "smooth" });
    }, 100);
  }

  handleClick(event) {
    var inside = true;
    var inside_orte = true;
    if ((event.target['id'] != 'rubrik_open') && (event.target['id'] != 'rubrik_arrow') && (event.target['id'] != 'rubrik_bar')) {
      inside = false
    } else {
      inside = true
    }
    if ((event.target['id'] != 'orte')) {
      inside_orte = false
    } else {
      inside_orte = true
    }
    this.rubrik_list_open = inside
    this.orte_list_show.next(inside_orte)
  }

  final_price = 1

  date_array = new BehaviorSubject<any[]>([])
  addDate(event: MatDatepickerInputEvent<any>) {
    if (!event.value) return
    this.datum_error = false;
    const parsed = moment(event.value)
    this.datePicker._datepickerInput.value = moment(parsed.startOf('month'))
    const date = parsed.format('DD.MM.YYYY')
    if (moment().diff(parsed, 'days') > 0) {
      this._snack.open("Dates can't be in the past", 'OK', { duration: 3000 });
      setTimeout(_ => (document.getElementById('datum') as HTMLInputElement).value = '', 0)
      return
    }
    setTimeout(_ => (document.querySelector('#datum') as HTMLInputElement).value = '')
    const dateArray = this.date_array.getValue()
    if (dateArray.indexOf(date) === -1) {
      dateArray.push(date)
      this.date_array.next(dateArray);
    }
    this.picker.select(undefined)
  }
  removeDate(i) {
    const dateArray = this.date_array.getValue()
    dateArray.splice(i, 1)
    this.date_array.next(dateArray)
  }

  file_images = new BehaviorSubject<File[]>([])
  file_text = new BehaviorSubject<File[]>([])

  fileListToArray(fileList) {
    return Array.prototype.slice.call(fileList)
  }

  RemoveFile(index: number): void {
    let files = this.file_text.getValue()
    files.splice(index, 1)
    this.file_text.next(files)
  }

  getIndex(item, index) {
    return index
  }

  RemoveImage(index: number): void {
    let files = this.file_images.getValue()
    files.splice(index, 1)
    this.file_images.next(files)
  }

  fileUpload() {
    (document.querySelector('#file_upload') as HTMLInputElement).click()
  }

  imageUpload() {
    (document.querySelector('#image_upload') as HTMLInputElement).click()
  }

  loadingTexts = new BehaviorSubject<boolean>(false)
  loadingImages = new BehaviorSubject<boolean>(false)

  onTextChange(event) {
    this.loadingTexts.next(true)
    const validExtensions = [
      'plain',
      'pdf',
      'rtf',
      'richtext',
      'x-soffice',
      'msword',
      'doc',
      'text',
      'vnd.msword',
      'vnd.ms-word',
      'winword',
      'word',
      'x-msw6',
      'x-msword',
      'docx',
      'vnd.openxmlformats-officedocument.wordprocessing.document',
      'vnd.openxmlformats-officedocument.wordprocessingml.document'];
    let files = event.target.files
    const filesB = this.file_text.getValue()
    if ((files.length + filesB.length) > 5) {
      this.showAlert('MIX für ungut!', this.translate.instant('aufgeben.termine.max_files_advice'));
      (document.querySelector('#file_upload') as HTMLInputElement).value = ''
      setTimeout(_ => this.loadingTexts.next(false))
      return
    }
    if (files.length > 5) {
      this._snack.open('Can\'t upload more than 5 files at once', '', { duration: 5000, horizontalPosition: 'left' });
      (document.querySelector('#file_upload') as HTMLInputElement).value = ''
      setTimeout(_ => this.loadingTexts.next(false))
      return
    }
    if (filesB.length > 5) {
      this._snack.open('Current text files exceeds the maximum allowed (5)', '', { duration: 5000, horizontalPosition: 'left' });
      (document.querySelector('#file_upload') as HTMLInputElement).value = ''
      setTimeout(_ => this.loadingTexts.next(false))
      return
    }
    const requests = []
    try {
      for (let file of files) {
        const extension = file.name.substr(file.name.lastIndexOf('.') + 1);
        const fileWithoutUTF8: any = new Blob([file.slice(0, file.size, file.type)], { type: file.type });
        fileWithoutUTF8.name = `document.${extension}`
        const formData = new FormData()
        formData.append('file', fileWithoutUTF8)
        requests.push(this.api.checkFileMIME(formData))
      }
    } catch (err) {
      console.log(err)
      setTimeout(_ => this.loadingTexts.next(false))
    }
    this.uploadingTexts$ = forkJoin(...requests).subscribe(mimes => {
      files = Array.from(files)
      files.forEach((file, i) => {
        const mime = mimes[i].mime
        const extension = mime.split('/').pop()
        if (validExtensions.indexOf(extension) > -1) {
          const files = this.file_text.getValue()
          files.push(file)
          this.file_text.next(files)
        }
      });
      setTimeout(_ => this.loadingTexts.next(false))
    }, err => setTimeout(_ => this.loadingTexts.next(false)),
    () => {
      try {
        (document.querySelector('#file_upload') as HTMLInputElement).value = '';
      } catch (err) { }
    });
  }

  onImageChange(event) {
    this.loadingImages.next(true)
    const validExtensions = [
      'jpeg',
      'jpg',
      'png',
      'gif',
      'tif',
      'tiff'
    ];
    let files: File[] = event.target.files
    const filesB = this.file_images.getValue()
    if ((files.length + filesB.length) > 5) {
      this.showAlert('MIX für ungut!', this.translate.instant('aufgeben.termine.max_files_advice'));
      try {
        (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      } catch (err) { }
      this.loadingImages.next(false)
      return
    }
    if (files.length > 5) {
      this._snack.open('Can\'t upload more than 5 files at once', '', { duration: 5000, horizontalPosition: 'left' });
      try {
        (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      } catch (err) { }
      this.loadingImages.next(false)
      return
    }
    if (filesB.length > 5) {
      this._snack.open('Current image files exceeds the maximum allowed (5)', '', { duration: 5000, horizontalPosition: 'left' });
      try {
        (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      } catch (err) { }
      this.loadingImages.next(false)
      return
    }
    const requests = []
    try {
      for (let file of files) {
        const extension = file.name.substr(file.name.lastIndexOf('.') + 1);
        const fileWithoutUTF8: any = new Blob([file.slice(0, file.size, file.type)], { type: file.type });
        fileWithoutUTF8.name = `image.${extension}`
        const formData = new FormData()
        formData.append('file', fileWithoutUTF8)
        requests.push(this.api.checkFileMIME(formData))
      }
    } catch (err) {
      console.log(err)
      setTimeout(_ => this.loadingTexts.next(false))
    }
    this.uploadingImages$ = forkJoin(...requests).subscribe(mimes => {
      files = Array.from(files)
      files.forEach((file, i) => {
        const mime = mimes[i].mime
        if (validExtensions.indexOf(mime.split('/').pop().toLowerCase()) > -1) {
          let files = [...this.file_images.getValue(), file]
          this.file_images.next(files)
        }
      });
      setTimeout(_ => this.loadingImages.next(false))
      try {
        (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      } catch (err) {
        setTimeout(_ => this.loadingImages.next(false))
      }
    });
  }

  uploadingImages$: Subscription
  uploadingTexts$: Subscription

  // Used for later use if one or more image fails to upload
  imageDictionary = []

  free = new BehaviorSubject<boolean>(true)
  vielen_dank = new BehaviorSubject<boolean>(false)
  disable_form = new BehaviorSubject<boolean>(false)
  sendForm() {
    let fields = []
    let message = false
    if (!this.form_privacy.value) {
      fields.push('FormPrivacy')
      message = true
      this.form_privacy_error = true;
    }
    if (!this.free.getValue() && !this.form_terms.value) {
      fields.push('FormTerms')
      message = true
      this.form_privacy_error = true;
    }
    if (message) {
      for (let field of fields) {
        fields[fields.indexOf(field)] = this.translate.instant("aufgeben.termine." + field.toLowerCase().replace(/\ /g, '_'))
      }
      this.showAlert("MIX für ungut!", this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', '))
      return
    }
    this.disable_form.next(true)
    this.checkFree();
    if (this.checkPage(1) && this.checkPage(2) && this.checkPage(3) && this.checkPage(5)) {
      var post = new FormData();
      const formKeys = Object.keys(this.form.controls)
      const sanitizeFields = ['titel', 'kurzebeschreibung', 'nachricht']
      const exclusions = ["datum", "rubrik"];
      formKeys.forEach(key => {
        if (exclusions.indexOf(key) > -1) return
        let value = this.form.get(key).value
        if (sanitizeFields.includes(key)) value = this._tools.sanitizeAufgebenTextField(value)
        post.append(key, value)
      })
      post.append("rubrik", this.rubrik_list_string.getValue());
      post.append("datum", this.date_array.getValue().join(";"));
      post.append("ver_email", this.form.value.ver_email.replace(/ /g, ''));
      post.append("ausstellungen_opening_hours", this.ausstellungen_opening_hours.value)
      const t_zeichen = this.titel.value.length + 8 + this.kurzebeschreibung.value.length
      const t_zeilen  = Math.ceil( t_zeichen / 82 )
      const t_anztage = this.date_array.getValue().length
      const t_summe   = t_anztage * 5 * (t_zeilen)
      const item_name = `${t_zeilen} Abrechnungseinheit(en) x 5 Euro x ${t_anztage} Tag(e) = ${t_summe},- Euro Brutto`
      post.append("item_name", item_name)
      post.append("item_amount", t_summe.toString())
      if (this.form.value.zahlung_per == 'lastschrift') {
        post.append("kontoinhaber", this.form.value.kontoinhaber);
        post.append("iban", this.form.value.iban);
      }
      if (this.form.value.image == 'ja') {
        const files = this.file_images.getValue()
        for (var i = 0; i < files.length; i++) {
          const extension = files[i].name.substr(files[i].name.lastIndexOf('.') + 1);
          const mime = files[i].type
          const fileWithoutUTF8: any = new Blob([files[i]], { type: mime })
          fileWithoutUTF8.name = `image_file_${i}.${extension}`
          post.append('image_file_' + i, fileWithoutUTF8, `image_file_${i}.${extension}`)
          this.imageDictionary.push({ post_name: `image_file_${i}`, real_name: files[i].name })
        }
      }
      const files = this.file_text.getValue()
      for (var i = 0; i < files.length; i++) {
        const extension = files[i].name.substr(files[i].name.lastIndexOf('.') + 1);
        const mime = files[i].type
        const fileWithoutUTF8: any = new Blob([files[i]], { type: mime });
        fileWithoutUTF8.name = `text_file_${i}.${extension}`
        post.append('text_file_' + i, fileWithoutUTF8, `text_file_${i}.${extension}`)
      }
      this.sending_form.next(true)
      if (this.uploadingImages$) this.uploadingImages$.unsubscribe();
      try {
        (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      } catch (err) { }
      this._subs.sink = this.api.sendAufgebenTermine(post).subscribe( data => {
        if (data == null || data == "error") {
          this.showAlert(this.translate.instant("aufgeben.error"), this.translate.instant("aufgeben.error_basic"))
        } else {
          if (data.response == "error") {
            this.showAlert('Error', data.description)
            if (data.description && data.details == 'image_corrupted') {
              const image_num = data.image
              let files = this.file_images.getValue()
              const imageExcluded = this.imageDictionary.filter(img => img.post_name == `image_file_${image_num}`)[0].real_name
              files.filter(file => file.name != imageExcluded)
              this.file_images.next(files)
            }
          } else {
            // Response is valid and it was successful
            try {
              // This will throw error when the selected rubrik is Austellungen
              this.picker.select(undefined)
            } catch (err) { }
            this.sessionid.next(data.key)
            this.abbuchung$.next(data.paymentdate)
            this.mandat_id.next(data.mandatid)
            this.vielen_dank.next(true)
            window.scrollTo({ top: 0 })
            if (this.zahlung_per.value == 'PayPal' && !this.free.getValue()) {
              this.openPaypal(data.key.substring(0, data.key.length - 3))
            }
          }
        }
      }, err => {
        this.showAlert('MIX für ungut!', this.translate.instant('aufgeben.error_request'))
      }, () => {
        this.loadingImages.next(false)
        this.sending_form.next(false)
        this.disable_form.next(false)
      })
    }
  }

  @ViewChild(MatDatepicker, { static: false })
  picker: MatDatepicker<any>;

  paypalUrl = new BehaviorSubject<string>('')

  openPaypal(pk) {
    // @ts-ignore
    this.paypalPayUrl = `${this.api_url}2010/paypal_submit.php?pk=${pk}`
    this.paypalUrl.next(this.paypalPayUrl)
    window.open(this.paypalPayUrl)
  }

  goPaypalUrl() {
    window.open(this.paypalPayUrl)
  }

  paypalPayUrl

  orte_search = new BehaviorSubject<string>('')

  getOrte(event) {
    if (event.key == "Enter") {
      (document.getElementById('orte') as HTMLInputElement).blur()
      return;
    }
    this.orte_search.next(event.target.value.toLowerCase())
  }

  vorwahl_fill = new BehaviorSubject<string>('')
  telefonnummer_fill = new BehaviorSubject<string>('')

  fillOrte(id, name) {
    var post = new FormData();
    this.veranstaltungsort_error = false;
    this.strasse_error = false;
    this.ort_error = false;
    this.plz_error = false;
    this.ver_vorwahl_error = false;
    this.ver_email_error = false;
    this.form.patchValue({ veranstaltungsort: name })
    post.append("adressid", id)
    this._subs.sink = this.api.getAufgebenSingleOrte(post).subscribe( data => {
      var response = data[0]
      if (response['telefon'].split('/').length > 1) {
        this.vorwahl_fill.next(response['telefon'].split('/')[0])
        this.telefonnummer_fill.next(response['telefon'].split('/')[1])
      } else {
        if (response['telefon'].split('-').length > 1) {
          this.vorwahl_fill.next(response['telefon'].split('-')[0])
          this.telefonnummer_fill.next(response['telefon'].split('-')[1])
        } else {
          this.vorwahl_fill.next('')
          this.telefonnummer_fill.next(response['telefon'])
        }
      }
      this.telefonnummer_fill.next(this.telefonnummer_fill.getValue().trim())
      this.vorwahl_fill.next(this.vorwahl_fill.getValue().trim())
      this.form.patchValue({ region: response['region'], strasse: response['strasse'], plz: response['plzort'].split(" ")[0], ort: response['plzort'].split(" ")[1], ver_vorwahl: this.vorwahl_fill.getValue(), ver_telefonnummer: this.telefonnummer_fill.getValue(), ver_email: response['email'], homepage: response['homepage'] })
    });
  }

  background = new BehaviorSubject<any[]>([])
  getBackground(num) {
    return this._sanitizer.bypassSecurityTrustStyle('url(' + this.file_images.getValue()[num].toString().split('"')[1] + ')');
  }

  //check if termine rubrik is free or not
  checkFree() {
    const not_free = ["führungen", "gleich und gleich", "hits für kids", "mädchen und frauen", "männer", "ständige treffs", "treffpunkte"]
    this.free.next(not_free.indexOf(this.rubrik_list_string.getValue().toLowerCase()) === -1)
  }

  goBackFromPage5(): void {
    this.changePage(4)
  }

  renew() {
    location.reload()
  }

  page = new BehaviorSubject<number>(1)

  changePage(n) {
    const page = this.page.getValue()
    if ((n > 5) || (n < 1)) return
    if (n < page) {
      this.page.next(n)
      window.scrollTo({ top: 0 })
    }
    else {
      if (this.checkPage(this.page.getValue())) {
        for (let i = 1; i < n; i++) {
          if (this.checkPage(i)) {
            continue
          } else {
            this.page.next(i)
            return
          }
        }
        if (this.uploadingImages$) {
          this.loadingImages.next(false)
          this.uploadingImages$.unsubscribe()
        }
        if (this.uploadingTexts$) {
          setTimeout(_ => this.loadingTexts.next(false))
          this.uploadingTexts$.unsubscribe()
        }
        this.page.next(n)
        window.scrollTo({ top: 0 });
      }
    }
  }
}

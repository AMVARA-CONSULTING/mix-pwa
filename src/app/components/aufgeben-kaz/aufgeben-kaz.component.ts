import { Component, OnInit, Inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ToolsService, safeGetStorageItem, safeSetStorageItem, sortByMonth, SubSink } from '@services/tools.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { InfoService } from '@services/info.service';
import { switchMap, map } from 'rxjs/operators';
import { API_URL } from 'app/tokens';

@Component({
	selector: 'app-aufgeben-kaz',
	templateUrl: './aufgeben-kaz.component.html',
	styleUrls: ['./aufgeben-kaz.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AufgebenKazComponent implements OnInit, OnDestroy {
	_subs = new SubSink()
	paymentId: any = '';
	paymentUrl: string = "";
	display: boolean = false;
	titles$: object = { "title": "AUFGEBEN" };
	privacy$: object;
	terms$: object;
	final_date$: object;
	abbuchung$ = new BehaviorSubject<any>(null)
	page: number = 1;
	page_limit: number = 3;
	form: FormGroup;
	message_alert = "";
	pre_alert_message = "";
	alert: boolean = false;
	rubriks = [];
	rubriks_list = "";
	monats = [];
	monats_list = "";
	units = new BehaviorSubject<number>(0);
	monats_no = 0;
	chiffre_no = 0;
	total = 0;
	checkboxValue = false;
	error: object;
	exit: boolean = false;
	exit_alert: boolean = false;
	confirm_alert: boolean = false;
	waiting = new BehaviorSubject<boolean>(false)
	paypal: boolean = false;
	kazid: any = "";
	rubriken_error = false

	mandat_id = new BehaviorSubject<string>('')

	reference_monat: boolean = false;
	reference_rubrik: boolean = false;
	reference_text: boolean = false;
	reference_nachricht: boolean = false;
	reference_personal: boolean = false;
	monat = new FormControl("", Validators.required);
	text = new FormControl("", Validators.required);
	text_error: boolean = false;
	typ_general = new FormControl("", Validators.required);
	typ_general_error: boolean = false;
	typ_style = new FormControl("", Validators.required);
	typ_style_error: boolean = false;
	rubriken_mit = new FormControl("", Validators.required);
	chiffre = new FormControl("", Validators.required);
	chiffre_error: boolean = false;
	chiffre_answer = new FormControl("", Validators.required);
	chiffre_answer_error: boolean = false;
	chiffre_mail = new FormControl("", Validators.required);
	chiffre_mail_error: boolean = false;
	anrede = new FormControl("", Validators.required);
	anrede_error: boolean = false;
	vorname = new FormControl("", Validators.required);
	vorname_error: boolean = false;
	nachname = new FormControl("", Validators.required);
	nachname_error: boolean = false;
	firma = new FormControl("");
	vorwahl = new FormControl("", Validators.required);
	vorwahl_error: boolean = false;
	telefon = new FormControl("", Validators.required);
	telefon_error: boolean = false;
	fax = new FormControl("", Validators.required);
	email = new FormControl("", Validators.required);
	email_error: boolean = false;
	strasse = new FormControl("", Validators.required);
	strasse_error: boolean = false;
	plz = new FormControl("", Validators.required);
	plz_error: boolean = false;
	ort = new FormControl("", Validators.required);
	ort_error: boolean = false;
	kto_inhaber = new FormControl("", Validators.required);
	iban_name_error: boolean = false;
	iban =  new FormControl("", Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z]{2}[0-9]{2}\s?[a-zA-Z0-9]{4}\s?[0-9]{4}\s?[0-9]{3}([a-zA-Z0-9]\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,3})?$/)]));
	iban_error: boolean = false;
	rechnung = new FormControl("Nein", Validators.required);
	rechnung_error: boolean = false;
	nachricht = new FormControl("", Validators.required);
	nachricht_error: boolean = false;
	zahlung = new FormControl("", Validators.required);
	zahlung_error: boolean = false;
	privacy_form = new FormControl("", Validators.required);
	terms_form = new FormControl("", Validators.required);

	updateChkbxArray(value, isChecked, key) {
		if (isChecked && this.rubriken_error) this.rubriken_error = false
		const chkArray = <FormArray>this.form.get(key);
		if (isChecked) {
			chkArray.push(new FormControl(value))
		} else {
			let idx = chkArray.controls.findIndex(x => x.value == value)
			chkArray.removeAt(idx)
		}
		const requriresChiffre = ['Er sucht Sie', 'Er sucht Ihn', 'Sie sucht Ihn', 'Sie sucht Sie']
		if ((chkArray.value as Array<string>).some(item => requriresChiffre.indexOf(item) > -1)) {
			if (!this.chiffre.value) this.chiffre.setValue(true)
			this.chiffre.disable()
		} else {
			this.chiffre.enable()
		}
		this.chiffre.updateValueAndValidity()
		this.calculateTotal()
	}

	ngOnDestroy() {
		this._subs.unsubscribe()
	}

	constructor(
		public translate: TranslateService,
		private _fb: FormBuilder,
		public api: ApiService,
		public globals: GlobalsService,
		private _tools: ToolsService,
		public _info: InfoService,
		@Inject(API_URL) private api_url: string
	) {
		// Check if Aufgeben is available, also checking if info is loaded, if not, wait for it
		if (!this._info.serverInfo.aufgeben_form_status) this.showAufgebenDisabled.next(true)
		this.form = this._fb.group({
			"monat": this.monat,
			"text": this.text,
			"typ_general": this.typ_general,
			"typ_style": this.typ_style,
			"rubriken_kat": this._fb.array([]),
			"rubriken_mit": this.rubriken_mit,
			"chiffre": this.chiffre,
			"chiffre_answer": this.chiffre_answer,
			"chiffre_mail": this.chiffre_mail,
			"anrede": this.anrede,
			"vorname": this.vorname,
			"nachname": this.nachname,
			"firma": this.firma,
			"telefon": this.telefon,
			"vorwahl": this.vorwahl,
			"fax": this.fax,
			"email": this.email,
			"strasse": this.strasse,
			"plz": this.plz,
			"ort": this.ort,
			"iban": this.iban,
			"kto_inhaber": this.kto_inhaber,
			"rechnung": this.rechnung,
			"nachricht": this.nachricht,
			"zahlung": this.zahlung,
			"privacy_form": this.privacy_form,
			"terms_form": this.terms_form
		})
		this._subs.sink = this.iban.valueChanges.pipe(
			map(iban => iban.replace(/\s+/g, '').toUpperCase().substr(0, 32)),
			map(iban => iban.match(/.{1,4}/g))
		).subscribe((numbers: any[]) => this.iban.setValue(numbers.join(' '), { emitEvent: false }))
		this._subs.sink = this.api.getAufKazText().subscribe(data => this.titles$ = data )
		this._subs.sink = forkJoin(
			this.api.getPrivacy(),
			this.api.getTerms(),
			this.api.getAbbuchungsKazen()
		).subscribe(([privacy, terms, abbuchung]) => {
			this.privacy$ = privacy
			this.terms$ = terms
			this.abbuchung$.next(abbuchung['date']),
			this.final_date$ = abbuchung['string']['wert']
		})
	}

	reference_typ: boolean = false;
	reference_art: boolean = false;
	checkPage1() {
		let fields = []
		this.reference_monat = false;
		this.reference_rubrik = false;
		this.reference_text = false;
		this.reference_nachricht = false;
		this.reference_personal = false;
		//text
		if (this.form.value.text.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.kleinenzeigentext'))
			this.text_error = true;
			this.reference_text = true
		} else {
			if (!this._tools.mixCamelCase(this.text.value.trim())) {
				fields.push(this.translate.instant('aufgeben.termine.titelcamelcase'))
				this.text_error = true;
				this.reference_text = true
			}
		}
		if (this.form.value.text.length > 30000) {
			this.message_alert = this.message_alert + "ANZEIGENTEXT (zu viele Buchstaben)";
			this.text_error = true;
			this.reference_text = true
		}
		//monat
		if ((this.monats_list == "") || (this.monats_list == ".")) {
			this.monats_list = ".";
			fields.push(this.translate.instant("aufgeben.kazen.monat"))
			this.reference_monat = true;
		}
		//rubriken & chiffre
		let missing = false
		if (this.form.get('rubriken_kat').value.length === 0) {
			this.rubriken_error = true
			fields.push(this.translate.instant('aufgeben.kazen.rubriken'))
		}
		if (this.chiffre.value && !this.chiffre_answer.value) {
			this.chiffre_answer_error = true
			missing = true
		}
		if ((this.form.value.chiffre == true) && (this.form.value.chiffre_mail == "") && (this.form.value.chiffre_answer == 'Per eMail und per Post')) {
			this.chiffre_mail_error = true
			missing = true
		}
		if (
			(this.form.value.chiffre == false) &&
			((this.rubriks_list.indexOf("SieIhn") != -1) || 
			(this.rubriks_list.indexOf("SieSie") != -1) || 
			(this.rubriks_list.indexOf("ErSie") != -1) || 
			(this.rubriks_list.indexOf("ErIhn") != -1))
		) {
			this.chiffre_error = true
			missing = true
		}
		if (missing) {
			fields.push(this.translate.instant('aufgeben.kazen.chiffre'))
			this.reference_rubrik = true;
		}
		if (this.chiffre.value && this.form.value.chiffre_answer == 'Per eMail und per Post') {
			if (!this._tools.validmail(this.chiffre_mail.value)) {
				fields.push(this.translate.instant('aufgeben.kazen.chiffre_format'))
				this.chiffre_error = true
			}
		}
		// Typ
		if (this.form.value.typ_general.trim() == "") {
			this.typ_general_error = true;
			fields.push(this.translate.instant("aufgeben.kazen.type"))
			this.reference_typ = true;
		}
		// Art
		if (this.form.value.typ_style.trim() == "") {
			this.typ_style_error = true;
			fields.push(this.translate.instant("aufgeben.kazen.art"))
			this.reference_art = true;
		}
		return fields
	}
	checkPage2() {
		let fields = []
		this.reference_monat = false;
		this.reference_rubrik = false;
		this.reference_text = false;
		this.reference_personal = false;
		this.reference_nachricht = false;
		var missing = false;
		//nachricht
		if (this.form.value.nachricht.length > 10000) { missing = true; this.nachricht_error = true }
		if (missing == true) {
			this.message_alert = this.message_alert + "NACHRICHT (zu viele Buchstaben)<br>"
			this.reference_nachricht = true;
		}

		//personal datein
		if (this.form.value.anrede.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.sex'))
			this.anrede_error = true
		}
		if (this.form.value.vorname.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.vorname'))
			this.vorname_error = true;
		}
		if (this.form.value.nachname.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.nachname'))
			this.nachname_error = true;
		}
		if (this.form.value.telefon.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.telefon'))
			this.telefon_error = true;
		}
		if (this.form.value.vorwahl.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.vorwahl'))
			this.vorwahl_error = true;
		}
		if (this.form.value.email.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.email'))
			this.email_error = true;
		}
		if (this.form.value.strasse.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.strasse'))
			this.strasse_error = true;
		}
		if (this.form.value.plz.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.plz'))
			this.plz_error = true;
		}
		if (this.form.value.ort.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.ort'))
			this.ort_error = true;
		}
		if (this.form.value.zahlung.trim() == "") {
			fields.push(this.translate.instant('aufgeben.kazen.zahlung'))
			this.zahlung_error = true
		}
		if ((this.form.value.zahlung == "Lastschrift") && (!this.form.value.kto_inhaber)) {
			fields.push(this.translate.instant('aufgeben.kazen.iban_name'))
			this.iban_name_error = true;
		}
		if (['Ja', 'Nein'].indexOf(this.rechnung.value) === -1) {
			fields.push(this.translate.instant('aufgeben.kazen.rechnung'))
			this.rechnung_error = true
		}
		if (this.form.value.zahlung == "Lastschrift") {
			if (this.iban.invalid) {
				fields.push(this.translate.instant('aufgeben.kazen.iban'))
				this.iban_error = true
			} else {
				if (this.iban.value.substring(0, 2) == 'DE' && this.iban.value.replace(/\ /g, '').length != 22) {
					fields.push(this.translate.instant('aufgeben.termine.iban_format'))
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
		if (fields.length === 0) {
			safeSetStorageItem('anrede', this.anrede.value)
			safeSetStorageItem('vorname', this.vorname.value)
			safeSetStorageItem('nachname', this.nachname.value)
			safeSetStorageItem('firma', this.firma.value)
			safeSetStorageItem('vorwahl', this.vorwahl.value)
			safeSetStorageItem('telefon', this.telefon.value)
			safeSetStorageItem('fax', this.fax.value)
			safeSetStorageItem('email', this.email.value)
			safeSetStorageItem('strasse', this.strasse.value)
			safeSetStorageItem('plz', this.plz.value)
			safeSetStorageItem('ort', this.ort.value)
			safeSetStorageItem('rechnung', this.rechnung.value)
			safeSetStorageItem('zahlung', this.zahlung.value)
			safeSetStorageItem('kto_inhaber', this.kto_inhaber.value)
		}
		return fields
	}
	checkForm() {
		this.calculateTotal();
		this.message_alert = "";
		this.pre_alert_message = 'MIX für ungut!';
		let page1fields = this.checkPage1()
		if (page1fields.length > 0 && this.page === 1) {
			this.message_alert = this.translate.instant('aufgeben.termine.error') + ' ' + page1fields.join(', ')
			this.alert = true;
			return
		}
		this.checkPage2()
		if ((this.form.value.privacy_form != true) || (this.form.value.terms_form != true)) {
			this.message_alert = this.message_alert + this.translate.instant("aufgeben.terms_error")
		}
		else {
			if ((this.globals.editing != true)) {
				this.checkConfirmation();
			}
			else {
				this.page = 4;
				this.alert = false;
			}
		}
	}

	textCalculation = new BehaviorSubject<string>('')

	//total price
	calculateTotal() {

		// default values
		let chiffre_add = ''
		let chiffre_no = this.chiffre.value ? 5 : 0
		let subtotal = 0
		let rubriks_no = this.form.get('rubriken_kat').value.length

		// calculate the values of this classified
		this.units.next(0)
		if ((this.form.value.text.length < 97) && (this.form.value.text.length > 0)) {
			this.units.next(1)
		} else {
			this.units.next(this.form.value.text.length / 97 + 1)
		}
		if (this.form.value.text.length == 0) {
			this.units.next(0)
		}
		this.units.next(Math.trunc(this.units.getValue()))
		var value = this.calculateValue()

		// the subtotal without chiffre fee
		subtotal = (this.units.getValue() * rubriks_no * this.monats_no * value);

		// the final sum ... no further calcs after this point
		this.total = ((this.units.getValue() * rubriks_no * this.monats_no) * value) + (chiffre_no * this.monats_no);

		// Add the ciffre values, if the form is selected accordingly
		if (this.chiffre.value) {
			chiffre_add = ` + Chiffregeb. ${chiffre_no * this.monats_no},- € (automatisch bei Kontaktanzeigen) = Summe ${this.total},- € Brutto`
		}

		// general information on calculation
		let text = `${this.text.value.length} Zeichen = ${this.units.getValue()} Einheit(en) x ${this.monats_no} Monat(e) x ${rubriks_no} Rubrik(en) x ${value},- Euro = `

		// add total text only if the total is bigger then 0 
		if (subtotal != 0) {
			text = text + `${subtotal},- € Brutto ${chiffre_add} `
		}
		this.textCalculation.next(text)
	}

	// value multiplier used on caculateTotal
	calculateValue() {
		var value = 0;
		if (this.form.value.typ_general == "Privat") value = value + 5;
		if (this.form.value.typ_general == "Gewerblich") value = value + 10;
		if (this.form.value.typ_style == "Fett") value = value + 5;
		if (this.form.value.typ_style == "Farbig") value = value + 10;
		return value;
	}

	renew() {
		location.reload()
	}

	showAufgebenDisabled = new BehaviorSubject<boolean>(false)

	// Triggered when the user clicks on the create similar button
	goSimilar() {
		if (!(safeGetStorageItem('cookies') === 'agree')) {
			this.pre_alert_message = this.translate.instant("aufgeben.termine.errmsg_cookies_pre")
			this.message_alert = this.translate.instant("aufgeben.termine.errmsg_cookies_msg")
			this.alert = true
		} else {
			this.page = 1
		}
	}

	checkRubrikAndChiffre() {
		if (
			(this.form.value.chiffre == false) && 
			((this.rubriks_list.indexOf("SieIhn") != -1) ||
			(this.rubriks_list.indexOf("SieSie") != -1) ||
			(this.rubriks_list.indexOf("ErSie") != -1) ||
			(this.rubriks_list.indexOf("ErIhn") != -1))
		) {
			this.chiffre_error = true;
		} 
		else this.chiffre_error = false;
	}

	//generate the monat array and list every time a change is made on the monat checklist, remove the monat if its already on the list
	loadMonat(ev) {
		var key = this.monats.indexOf(ev.target.defaultValue)
		if (key == -1) {
			this.monats.push(ev.target.defaultValue)
			this.monats_no++
		} else {
			this.monats.splice(key, 1)
			this.monats_no--
		}

		this.monats_list = this.monats.join(', ')
		this.calculateTotal()
	}

	//next and back buttons
	changePage(direction) {
		this.calculateTotal()
		if (direction == 'back') {
			if (this.page > 1) {
				this.checkPage(this.page, this.page - 1)
			}
		}
		if (direction == 'forward') {
			if (this.page < this.page_limit) {
				this.checkPage(this.page, this.page + 1)
			}
		}
	}
	//yes or no alert box
	checkConfirmation() {
		this.message_alert = "";
		this.pre_alert_message = "";
		this.alert = true;
		this.confirm_alert = true;
	}

	//check if current page form is valid before changing page
	checkPage(actual_page, page_to_go) {
		this.message_alert = "";
		this.pre_alert_message = 'MIX für ungut!';
		if (actual_page == 1) {
			let fields = this.checkPage1()
			if (fields.length > 0) {
				this.message_alert = this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', ')
				this.alert = true
				return
			}
		}
		if (this.message_alert != "") {
			this.alert = true;
			this.scrollToError()
		}
		else {
			if (page_to_go == 3) {
				let fields = this.checkPage2()
				if (fields.length > 0) {
					this.message_alert = this.translate.instant("aufgeben.termine.error") + ' ' + fields.join(', ')
					this.alert = true
					return
				}
				if (this.message_alert != "") {
					this.alert = true
					this.scrollToError()
				} else {
					this.page = page_to_go
					window.scrollTo({ top: 0 })
				}
			} else {
				this.page = page_to_go
				window.scrollTo({ top: 0 })
			}
		}
	}

	sendForm() {
		this.waiting.next(true)
		let fields = []
		if (!this.privacy_form.value) {
			fields.push(this.translate.instant('aufgeben.termine.formprivacy'))
		}
		if (!this.terms_form.value) {
			fields.push(this.translate.instant('aufgeben.termine.formterms'))
		}
		if (fields.length > 0) {
			this.pre_alert_message = 'MIX für ungut!'
			this.message_alert = this.translate.instant('aufgeben.termine.error') + fields.join(', ')
			this.alert = true
			this.waiting.next(false)
			return
		}
		let page1fields = this.checkPage1()
		let page2fields = this.checkPage2()
		if (page1fields.length > 0 || page2fields.length > 0) {
			this.pre_alert_message = 'MIX für ungut!'
			this.message_alert = 'Form invalid'
			this.alert = true
			this.waiting.next(false)
			return
		}
		let form = new FormData();
		if (this.form.value.chiffre == false) {
			this.form.value.chiffre_answer = '';
			this.form.value.chiffre_mail = '';
		}
		if (this.form.value.zahlung != 'Lastschrift') {
			this.form.value.iban = '';
			this.form.value.kto_inhaber = '';
		}
		const formKeys = Object.keys(this.form.controls)
		const sanitizeFields = ['text', 'nachricht']
		const exceptions = ['monat'];
		formKeys.forEach(key => {
			if (exceptions.indexOf(key) > -1) return
			let value = this.form.get(key).value
			if (sanitizeFields.includes(key)) value = this._tools.sanitizeAufgebenTextField(value)
			form.append(key, value)
		})
		form.append('monat', this.monats_list.replace(/\s+/g, '').split(',').sort(sortByMonth).join(','))
		form.append('rubriken_list', this.form.get('rubriken_kat').value.join(','))
		form.append('chiffre_ja_nein', this.chiffre.value)
		form.append('rechnung', this.form.value.rechnung || 'Nein')
		form.append('zeichen', this.form.value.text.length)
		form.append('zeilen', this.units.getValue().toString())
		form.append('anzmon', this.monats_no.toString())
		form.append('anzrub', this.form.get('rubriken_kat').value.length.toString())
		form.append('chiffre', (this.chiffre.value ? 5 * this.monats_no : 0).toString())
		form.append('summe', this.total.toString())
		form.append('abbuchung', this.final_date$.toString())
		form.append('user', this.api.user)
		form.append('item_name', this.textCalculation.getValue())
		form.append('item_amount', this.total.toString())
		this._subs.sink = this.api.sendAufKazForm(form).subscribe(
			data => {
				this.error = data
				this.abbuchung$.next(data.paymentdate)
				this.mandat_id.next(data.mandatid)
				this.ValidateForm(this.error, this.form.value.zahlung)
				if (this.zahlung.value=='PayPal') {
					this.openPaypal(data.key.substring(0, data.key.length - 4))
				}
				this.page = 4
			},
			() => {},
			() => this.waiting.next(false)
		)
		
	}

	//manage the action after correctly sending the form diferentiate between lastschrift and paypal, outputs the error if response contains error, 
	ValidateForm(err, mode) {
		if ((String(err).startsWith("EX-") == false) && (err != null) && (mode == 'Lastschrift')) {
			this.page = 4;
			this.kazid = err['key'];
		} else {
			if ((String(err).startsWith("EX-") == false) && (err != null) && (mode == 'PayPal') && (err != null)) {
				this.kazid = err['key'];
				this.page = 4
			} else {
				this.confirm_alert = false
				this.pre_alert_message = 'MIX für ungut!'
				this.message_alert = this.translate.instant("aufgeben.error_basic")
				this.alert = true
			}
		}
		this.waiting.next(false)
	}
	ngOnInit() {
		window.scrollTo(0, 0)
		const storageValues = ['anrede', 'vorname', 'nachname', 'firma', 'vorwahl', 'telefon', 'fax', 'email', 'strasse', 'plz', 'ort', 'rechnung', 'zahlung', 'kto_inhaber']
		for (let value of storageValues) {
			if (safeGetStorageItem(value)) {
				this[value].setValue(safeGetStorageItem(value))
			}
		}
		this._subs.sink = this.text.valueChanges.subscribe(_ => this.calculateTotal())
	}

	paypalUrl = new BehaviorSubject<string>('')

	openPaypal(pk) {
		this.paypalPayUrl = `${this.api_url}2010/paypal_submit.php?kaz=${pk}`
		this.paypalUrl.next(this.paypalPayUrl)
		window.open(this.paypalPayUrl)
	}

	goPaypalUrl() {
		window.open(this.paypalPayUrl)
	}

	paypalPayUrl

	//when editing, send the new input value to the backend, after that, refresh the data
	saveEdit(event, where) {
		let edit_form = new FormData();
		edit_form.append('where', where)
		edit_form.append('what', event.target.value)
		this._subs.sink = this.api.sendAufKazEdit(edit_form)
		.pipe(
			switchMap(_ => this.api.getAufKazText())
		)
		.subscribe(data => this.titles$ = data)

	}
	scrollToError() {
		setTimeout(() => {
			var reference = document.getElementsByClassName("error_reference");
			reference[0].scrollIntoView({ block: "start", behavior: "smooth" });
		}, 100);
	}
	formatIban(iban) {
		return iban.replace(/.(?=.{4,}$)/g, '*');
	}
}
import { Injectable, Inject } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { HttpClient } from '@angular/common/http';
import { GenericInfo, Event, EventsReponse, CaptchaResponse, ISuccess, Ticket, ProviderTicket } from '@other/interfaces';
import { API_URL } from 'app/tokens';
import { map } from 'rxjs/internal/operators/map';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  user: string = ".user_placeholder" //user placeholderr
  kazens: any;

  constructor(
    private http: HttpClient,
    public globals: GlobalsService,
    @Inject(API_URL) private api_url: string
  ) { }
  // Observable to retrieve marketplace rubriks
  getAllRubriks(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/kazen/get_kazens.php?mode=all')
  }

  getSimpleInfo(): Observable<GenericInfo> {
    return this.http.get<GenericInfo>(this.api_url + `data/mix20_generic_rest_api.php`)
  }

  // Get Mandat-ID within ServerInfo
  getMandatID(iban: string): Observable<GenericInfo> {
    return this.http.get<GenericInfo>(this.api_url + `data/mix20_generic_rest_api.php?mandatid=${iban}`)
  }

  // Observable to retrieve specific rubrik
  getRubrik(rubrik: string): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/kazen/get_kazens.php?mode=' + rubrik)
  }

  // Observable to retrieve specific rubrik info
  getKazens(): Observable<any[]> {
    this.kazens = this.http.get<any[]>(this.api_url + 'data/kazen/get_kazen_results.php?mode=all')
    this.kazens.subscribe(data => this.kazens = data)
    return this.kazens
  }
  getKazenRes($rubrik: string): Observable<any[]> {
    return this.kazens = this.http.get<any[]>(this.api_url + 'data/kazen/get_kazen_results.php?rubrik=' + $rubrik)

  }
  getKazenBanner(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/kazen/get_banner.php')

  }
  //Sends mail form and files
  sendMailForm(form: any): Observable<any> {
    return this.http.post<any>(this.api_url + 'data/kazen/get_email_form.php', form);
  }

  // Get if captcha is required on forms
  getCaptcha(): Observable<CaptchaResponse> {
    return this.http.get<CaptchaResponse>(this.api_url + 'data/kazen/captcha.php')
  }
  //retrieve user mails (to check if the user sent any)
  getMail(form): Observable<any[]> {
    return this.http.post<any[]>(this.api_url + 'data/kazen/get_mails.php', form)
  }

  checkFileMIME(form): Observable<any> {
    return this.http.post(this.api_url + 'data/aufgeben/termine/check_file_mime.php', form)
  }
  //send aufgeben (for kazen)
  sendAufKazForm(form: any): Observable<any> {
    return this.http.post<any>(this.api_url + 'data/aufgeben/kaz_auf/get_kazen_form.php', form);
  }
  getPaypalPayment(): Observable<any> {
    const post = new FormData()
    return this.http.post<any>(this.api_url + 'data/aufgeben/termine/paypal.php', post);
  }
  getKazPaypalPayment(form): Observable<any[]> {
    return this.http.post<any[]>(this.api_url + 'data/aufgeben/kaz_auf/paypal.php', form);
  }
  //send edit mode changes from aufgeben
  sendAufKazEdit(data: any): Observable<any[]> {
    return this.http.post<any[]>(this.api_url + 'frontend_edit/aufgaben_kazen_edit.php?lang=' + this.globals.language, data)
  }
  //get texts for aufgeben from the database
  getAufKazText(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'frontend_edit/get_aufgeben_text.php?lang=' + this.globals.language)
  }
  //get privacy checkbox content for aufgeben
  getPrivacy(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/aufgeben/get_form_privacy.php')
  }
  //checkbox text from kazen aufgeben
  getTerms(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/aufgeben/get_form_terms.php')
  }
  //get abbuchung data from sys_abbuchung
  getAbbuchungsTermine(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/aufgeben/get_abbuchung_ter.php')
  }
  getAbbuchungsKazen(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/aufgeben/get_abbuchung_kaz.php')
  }
  //get impressum from backend
  getImpressum(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/impressum/get_impressum.php?lang=de')
  }
  //get datenschutz (rechtliches) from backend
  getDatenschutz() {
    return this.http.get(this.api_url + '2011/rechtliches.php', { responseType: 'text' })
  }
  //get all the events categories
  getEvents_rubrik(form): Observable<any[]> {
    return this.http.post<any[]>(this.api_url + 'data/termine/get_events_rubrik.php', form)
  }
  //get all the events
  getEvents(): Observable<EventsReponse> {
    return this.http.get<EventsReponse>(this.api_url + 'data/termine/get_events.php')
  }
  getEventSearch(form: any): Observable<EventsReponse> {
    return this.http.post<EventsReponse>(this.api_url + 'data/termine/get_events.php', form);
  }

  /**
   * Return the data of a single event
   * @param id hashid of the event
   */
  getSingleEvent(id): Observable<Event> {
    return this.http.get<Event>(`${this.api_url}data/termine/get_events.php?eventid=${id}`)
  }

  /**
   * Return the tickets of a single event
   * @param id hashid of the event
   */
  getEventTickets(id): Observable<ProviderTicket[]> {
    return this.getSingleEvent(id)
    .pipe(
      map(event => event.tickets)
    )
  }

  promoteEvent(id, mode) {
    return this.http.post(this.api_url + 'data/termine/promote_events.php?flag=' + mode, id, { responseType: 'text' })
  }
  //save text editing (aufgeben uses another function)
  saveEdit(event, where, groupe) {
    var error: object;
    let edit_form = new FormData();
    edit_form.append('where', where)
    edit_form.append('what', event.target.value)
    edit_form.append('groupe', groupe)
    this.http.post(this.api_url + 'text_edit/save_edit.php?lang=' + this.globals.language, edit_form).subscribe( data => error = data );
    return error
  }
  getAllOrte(): Observable<any[]> {
    return this.http.get<any[]>(this.api_url + 'data/termine/get_orte.php')
  }

  logInWithMix(login) {
    return this.http.post<any>(this.api_url + 'data/login/login.php', login)
  }
  createAccountMix(form) {
    return this.http.post<any[]>(this.api_url + 'data/login/new_acc.php', form)
  }
  sendKontaktformular(form) {
    return this.http.post<any>(this.api_url + 'data/impressum/formular.php', form)
  }
  sendAssistance(form) {
    return this.http.post<any>(this.api_url + 'data/termine/assistant.php', form)
  }
  sendTerminePin(form) {
    return this.http.post<any>(this.api_url + 'data/termine/pin_event.php', form)
  }
  getMerkliste(form) {
    return this.http.post<any[]>(this.api_url + 'data/merkliste/get_merkliste.php', form)
  }
  changePassword(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/changePass.php', form)
  }
  changeEmail(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/changeEmail.php', form)
  }
  resetAssistance(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/resetAssistance.php', form)
  }
  resetMerkliste(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/resetMerkliste.php', form)
  }
  deleteAccount(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/deleteAccount.php', form)
  }
  setWasWannWo(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/setWasWannWo.php', form)
  }
  getWasWannWo(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/getWasWannWo.php', form)
  }
  setPin(form) {
    return this.http.post<any[]>(this.api_url + 'data/kazen/SetPin.php', form)
  }
  getPin(form) {
    return this.http.post<any[]>(this.api_url + 'data/kazen/GetPin.php', form)
  }
  deletePin(form) {
    return this.http.post<any[]>(this.api_url + 'data/merkliste/delete_pin.php', form)
  }
  getTotalPin(form) {
    return this.http.post<any[]>(this.api_url + 'data/merkliste/total_pin.php', form)
  }
  localStorage(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/set_localstorage.php', form)
  }
  forgotEmail(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/forgotEmail.php', form)
  }
  forgotEmailSendCode(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/forgotEmail_get_code.php', form)
  }
  forgotEmailChangePass(form) {
    return this.http.post<any[]>(this.api_url + 'data/user_functions/forgotEmail_change_pass.php', form)
  }
  sendAufgebenTermine(form) {
    return this.http.post<any>(this.api_url + 'data/aufgeben/termine/get_form.php', form)
  }
  getAufgebenOrte() {
    return this.http.get<any[]>(this.api_url + 'data/aufgeben/termine/get_orte.php')
  }
  getAufgebenSingleOrte(form) {
    return this.http.post<any[]>(this.api_url + 'data/aufgeben/termine/get_single_orte.php', form)
  }
  getPrint() {
    return this.http.get<any[]>(this.api_url + 'data/print/get_print.php')
  }

  // Get Dates for a specific event (temporarily, pls implement a specific eventid getter to avoid collisions)
  getKinoDates(title: string) {
    const form = new FormData()
    form.append('rubrik_list', 'Kino')
    form.append('days_no', '50')
    form.append('by_hours', '-1')
    form.append('default', 'false')
    form.append('searchstring', title)
    return this.http.post<EventsReponse>(this.api_url + 'data/termine/get_events.php', form)
  }

  sendFeedback(form: FormData): Observable<ISuccess> {
    return this.http.post<ISuccess>(`${this.api_url}data/feedback.php`, form)
  }

  getTicketUrl(flag: string, eventid: string): Observable<Ticket> {
    return this.http.get<GenericInfo>(`${this.api_url}data/mix20_generic_rest_api.php?${flag}&eventhash=${eventid}`).pipe( map(data => data.ticket) )
  }

  checkAvailableProtocol(protocol: string, url: string): Observable<boolean> {
    return new Observable(observer => {
      var url = `${protocol}://${url}`;
      var request = new XMLHttpRequest();
      if (request) {
        request.open("GET", url);
        if (request.status < 400) {
          observer.next(true)
          observer.complete()
        } else {
          observer.next(false)
          observer.complete()
        }
      }
    })
  }

  /**
   * Return the ticket link whichs redirects to the buy ticket page
   * @param provider
   * @param id 
   * @param eventhash 
   */
  generateTicketLink(provider: string, id: string | number, eventhash: string): string {
    return `${this.api_url}data/termine/ticket.php?provider=${provider}&id=${id}&hash=${eventhash}`
  }
}

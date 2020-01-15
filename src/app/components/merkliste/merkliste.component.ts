import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalsService } from '@services/globals.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AttendDialog } from 'app/dialogs/attend/attend.dialog';
import { ShareDialog } from 'app/dialogs/share/share.dialog';
import { API_URL } from 'app/tokens';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SubSink } from '@services/tools.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'mix-merkliste',
  templateUrl: './merkliste.component.html',
  styleUrls: ['./merkliste.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerklisteComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  termine_list = new BehaviorSubject<any[]>([])
  kazen_list = new BehaviorSubject<any[]>([])

  constructor(
    public _translate: TranslateService,
    public _globals: GlobalsService,
    private _api: ApiService,
    public _user: UserService,
    private _sanitizer: DomSanitizer,
    public _router: Router,
    private _dialog: MatDialog,
		@Inject(API_URL) private api_url: string
  ) { }

  openAttend(e: MouseEvent, termine: any) {
    e.stopPropagation()
    this._dialog.open(AttendDialog, {
      width: '400px',
      data: termine
    })
  }

  loaded = new BehaviorSubject<boolean>(false)

  ngOnInit() {
    this._globals.changeBody(true)
    this.onResize()
    this._subs.sink = forkJoin(
      this.getMerkliste('termine'),
      this.getMerkliste('kazen'),
      this.getMails()
    ).subscribe(_ => {
      this.loaded.next(true)
    })
    this._globals.login_page.next(false)
    this._globals.settings_page.next(false)
    setTimeout(() => {
      this._globals.changeBody(true)
    }, 100);
  }
  ngOnDestroy() {
    this._subs.unsubscribe()
    this._globals.changeBody(false)
    this._globals.exited_merkliste = true
    this._globals.merkliste_page.next(false)
  }
  getMerkliste(mode): Observable<any> {
    return new Observable(observer => {
      var form = new FormData()
      form.append("id", this._user.id)
      form.append("token", this._user.token)
      if (this._user.social != null) {
        form.append('authToken', this._user.social['authToken'])
        form.append('idToken', this._user.social['idToken'])
        form.append('idToken', this._user.social['idToken'])
        form.append("origin", this._user.social['provider'])
      } else {
        form.append("origin", 'mix')
      }
      form.append("mode", mode)
      this._subs.sink = this._api.getMerkliste(form).subscribe(data => {
        if (data['response'].startsWith("EX")) {
          this.showAlert(this._translate.instant("user_errors.sorry"), this._translate.instant("user_errors.logged_in"))
          this._user.signOut()
          this._globals.merkliste_page.next(false)
        } else {
          if (mode == 'termine') {
            this.termine_list.next([])
            if (data['response'] == 'ok') {
              this.termine_list.next(data['data'])
            }
          }
          if (mode == 'kazen') {
            this.kazen_list.next([])
            if (data['response'] == 'ok') {
              this.kazen_list.next(data['data'])
            }
          }
        }
      }, err => { }, () => {
        observer.next(null)
        observer.complete()
      })
    })
  }

  goEvent(termine: any) {
    this._router.navigate(['/termine/', termine.eventid], { queryParams: { returnTo: 'merkliste' } } ).then(() => {
      this._globals.merkliste_page.next(true)
    })
  }

  // Open Share Dialog
  openShare(e: MouseEvent, event): void {
    e.stopPropagation()
    this._dialog.open(ShareDialog, {
      width: '350px',
      data: event
    })
  }

  //pass the eventid from the event you deleted from the merkliste to the termine-detail page to update the status
  deleteTerminePin(eventid) {
    this._globals.termine_pin_deleted = eventid;
  }
  sanitizeTitel(s) {
    return s.replace(/\//g, "-");
  }

  deletePin(e: MouseEvent, mode, id) {
    e.stopPropagation()
    var form = new FormData()
    form.append("id", this._user.id)
    form.append("token", this._user.token)
    if (this._user.social != null) {
      form.append('authToken', this._user.social['authToken'])
      form.append('idToken', this._user.social['idToken'])
      form.append('idToken', this._user.social['idToken'])
      form.append("origin", this._user.social['provider'])
    } else {
      form.append("origin", 'mix')
    }
    form.append("mode", mode)
    form.append("eventid", id)
    this._subs.sink = this._api.deletePin(form).subscribe( data => {
      if (data != null) {
        if (data["response"] == 'deleted') {
          this.getMerkliste(mode)
          if (mode == 'termine') {
            this.deleteTerminePin(id)
            this.termine_list.next(this.termine_list.getValue().filter(termin => termin.eventid !== id))
          } else {
            this.kazen_list.next(this.kazen_list.getValue().filter(kazen => kazen.kazen_id !== id))
          }
          this._user.getTotalPins()
        } else {
          this.showAlert(this._translate.instant("user_errors.sorry"), this._translate.instant("user_errors.general_error"))
        }
      }
    })
  }

  column_no: Number;
  @HostListener('window:resize') onResize() {
    var screenWidth = window.innerWidth
    this.column_no = 1
    if (screenWidth >= 760) this.column_no = 2
    if (screenWidth >= 1260) this.column_no = 3
    if (this.column_no > 3) this.column_no = 3
    if (this._globals.checkSafari()) this.column_no = 1
  }

  email: String = ''
  checkForm() { //close mail
    this.email = ''
    this.getMails()
  }

  text: String = "";
  SetUpMail(id, text) { //prepare and display mail
    this.returnTo = 'merkliste'
    this.email = id;
    this.text = text;
  }

  returnTo = null

  mail_data$ = []

  getMails(): Observable<any> {
    return new Observable(observer => {
      if (this._user.logged_in) {
        var form = new FormData()
        form.append("id", this._user.id)
        form.append("token", this._user.token)
        if (this._user.social != null) {
          form.append('authToken', this._user.social['authToken'])
          form.append('idToken', this._user.social['idToken'])
          form.append('idToken', this._user.social['idToken'])
          form.append("origin", this._user.social['provider'])
        } else {
          form.append("origin", 'mix')
        }
        this._subs.sink = this._api.getMail(form).subscribe(
          data => this.mail_data$ = data,
          err => { },
          () => {
            observer.next(null)
            observer.complete()
          }
        )
      }
    })
  }

  //check if user sent a mail to this kazen
  checkSend(hash) {
    if ((this._user.logged_in) && (this.mail_data$ != null)) {
      var value = false
      if ((this.mail_data$['response'] != null) && (this.mail_data$['data'] != null) && (!this.mail_data$['response'].startsWith("EX-"))) {
        var i
        var lenght = Object.keys(this.mail_data$['data']).length;
        for (i = 0; i < lenght; i++) {
          if (this.mail_data$['data'][i]["kazen_hash"] != null) {
            if (this.mail_data$['data'][i]["kazen_hash"] == hash) {
              value = true
            }
          }
        }
        return value
      }
    }
  }

  @HostListener('window:popstate') onBack() {
    if ((this._globals.merkliste_page.getValue()) && (!this._globals.menu.getValue())) {
      this._globals.merkliste_page.next(false)
    }
  }

  backHistory() {
    window.history.back();
  }

  waiting = false
  alert = false
  pre_alert_message = ""
  message_alert = ""
  simple_alert = false

  showAlert(pre_alert, message) {
    this.alert = true
    this.pre_alert_message = pre_alert
    this.message_alert = message
    this.waiting = true
  }
  removeAlert() {
    this.alert = false
    this.simple_alert = false
    this.pre_alert_message = ""
    this.message_alert = ""
    this.waiting = false
  }
}
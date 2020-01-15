import { Component, ChangeDetectionStrategy, Inject, OnInit, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { ClipboardService } from 'ngx-clipboard';
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "@services/user.service";
import { ApiService } from "@services/api.service";
import { ToolsService, SubSink } from "@services/tools.service";
import { AttendDialog } from "../attend/attend.dialog";
import { GlobalsService } from "@services/globals.service";
import { InstallMessengerDialog } from "@dialogs/install-messenger/install-messenger.dialog";
import { EventProvidersDialog } from "@dialogs/event-providers/event-providers.dialog";
import { EventProvider, Event } from "@other/interfaces";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

declare const window: any

@Component({
  selector: 'mix-share',
  templateUrl: 'share.dialog.html',
  styleUrls: ['./share.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareDialog implements OnInit, OnDestroy {

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  _subs = new SubSink()

  constructor(
    public dialogRef: MatDialogRef<ShareDialog>,
    private _translate: TranslateService,
    private _sanitizer: DomSanitizer,
    private _clipboard: ClipboardService,
    private _snack: MatSnackBar,
    private _user: UserService,
    private _api: ApiService,
    private _tools: ToolsService,
    private _dialog: MatDialog,
    public _globals: GlobalsService,
    @Inject(MAT_DIALOG_DATA) public data: Event | any
  ) {
    this.ticketAvailable = !!this.data.flag
    this.link = `${location.protocol}//${location.host}/#/termine/${data.eventid}-${data.sessionid}`
    this.mailUrl = this._sanitizer.bypassSecurityTrustUrl(`mailto:?subject=${this._translate.instant('email_share_subject')}&body=${this._translate.instant('share').replace('$URL', this.link)}`)
    this.whatsappUrl = this._sanitizer.bypassSecurityTrustUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(this.link)}`)
    this._subs.sink = this._api.checkAvailableProtocol('fb-messenger', `share/?link=${encodeURIComponent(this.link)}`).subscribe(available => {
      this.messengerAvailable.next(available)
    })
    this.showMessenger = this._tools.isMobile()
    if (this.data.flag) {
      // There we can have multiple ticket providers, for example KINOHELD=45345,DK=27345
      const flags = this.data.flag.split(',').map(flag => ( { provider: flag.split('=')[0], id: flag.split('=')[1] } ) as EventProvider )
      if (flags.length === 1) {
        console.log(this.data)
        const url = this._api.generateTicketLink(flags[0].provider, flags[0].id, this.data.eventid)
        this.ticketLink = this._sanitizer.bypassSecurityTrustUrl(url)
      }
    }
  }

  ticketLink: SafeUrl = null

  showMessenger = false

  openMessenger() {
    // Check if the protocol fb-messenger is registered in the mobile or tablet
    // If not available, display a window to dissuade the client from installing the App
    const _this = this
    window.protocolCheck(`fb-messenger://share/?link=${encodeURIComponent(this.link)}`,
      function(fail) {
        _this._dialog.open(InstallMessengerDialog, { width: '300px'})
      },
      function(success) {
        // console.log("Messenger Compatible: ", true)
      }
    )
  }

  attended = new BehaviorSubject<boolean>(false)
  favourited = new BehaviorSubject<boolean>(false)
  loading_stats = new BehaviorSubject<boolean>(true)
  sending_attend = new BehaviorSubject<boolean>(false)
  
  messengerAvailable = new BehaviorSubject<boolean>(false)
  ticketAvailable = false

  assistants = new BehaviorSubject<number>(0)

  ngOnInit() {
    if (this._user.loggedIn.getValue()) {
      // Check if the event is already on attend list
      var user_data = new FormData()
      user_data.append("id", this._user.id)
      user_data.append("token", this._user.token)
      if (this._user.social != null) {
        user_data.append('authToken', this._user.social['authToken'])
        user_data.append('idToken', this._user.social['idToken'])
        user_data.append("origin", this._user.social['provider'])
      } else {
        user_data.append("origin", 'mix')
      }
      user_data.append('eventid', this.data.eventid.toString())
      user_data.append('mode', 'check')
      user_data.append('add', 'false')
      this._subs.sink = this._api.sendAssistance(user_data).subscribe(data => {
        if (data['response'] == '1') this.attended.next(true)
      })
      // Check if the event is already in the favourite list
      var user_data = new FormData;
      user_data.append("id", this._user.id)
      user_data.append("token", this._user.token)
      if (this._user.social != null) {
        user_data.append('authToken', this._user.social['authToken'])
        user_data.append('idToken', this._user.social['idToken'])
        user_data.append("origin", this._user.social['provider'])
      } else {
        user_data.append("origin", 'mix')
      }
      user_data.append('eventid', this.data.eventid.toString())
      user_data.append('mode', 'check')
      user_data.append('add', 'false')
      this._subs.sink = this._api.sendTerminePin(user_data).subscribe(data => {
        this.favourited.next(data.response === 'yes pin')
      })
      // Get quantity of attended users
      const form = new FormData()
      form.append("id", this._user.id)
      form.append("token", this._user.token)
      if (this._user.social) {
        form.append('authToken', this._user.social['authToken'])
        form.append('idToken', this._user.social['idToken'])
        form.append("origin", this._user.social['provider'])
      } else {
        form.append("origin", 'mix')
      }
      form.append('eventid', this.data.eventid.toString())
      form.append('mode', 'list')
      form.append('add', 'false')
      this._subs.sink = this._api.sendAssistance(form).subscribe(data => {
        this.assistants.next(data.total || 0)
      })
    }
  }

  openBuyCart() {
    if (this.data.flag) {
      // There we can have multiple ticket providers, for example KINOHELD=45345,DK=27345
      const flags = this.data.flag.split(',').map(flag => ( { provider: flag.split('=')[0], id: flag.split('=')[1] } ) as EventProvider )
      if (flags.length > 1) {
        this._dialog.open(EventProvidersDialog, {
          data: {
            providers: flags,
            eventid: this.data.eventid,
            eventhash: this.data.eventid
          },
          minWidth: '350px',
          autoFocus: false
        })
      } else {
        let win = window.open('', '_blank');
        win.document.write('Bitte warten Sie ein paar Sekunden...')
        this._subs.sink = this._api.getTicketUrl(this.data.flag, this.data.eventid).subscribe(ticket => {
          win.location = ticket.url
          win.focus()
        })
      }
    } else {
      this._tools.alert('MIX für ungut!', this._translate.instant('termine.no_ticket_available'), '', 'OK')
    }
  }

  openAttend() {
    if (this._user.logged_in) {
      const attendInstance = this._dialog.open(AttendDialog, {
        width: '400px',
        data: this.data
      })
      this._subs.sink = attendInstance.componentInstance.attended.subscribe(attended => {
        if (attended !== this.attended.getValue()) {
          if (attended ) {
            this.assistants.next(this.assistants.getValue() + 1)
          } else {
            this.assistants.next(this.assistants.getValue() - 1)
          }
        }
        this.attended.next(attended)
      })
    } else {
      this._tools.alert(this._translate.instant("termine_details.alert1"), 'Du willst anderen zeigen, dass Du bei dieser Veranstaltung dabei bist? Dann <span class="alert-link">klicke bitte zuerst hier</span>, um Dich anzumelden.', '', 'OK');
      setTimeout(_ => {
        try {
          document.querySelector('.alert-link').addEventListener('click', () => {
            (document.querySelector('.head_icon.user_container') as HTMLElement).click();
            this.dialogRef.close();
            (document.querySelector('.alert-box') as HTMLElement).style.display = 'none';
          })
        } catch (err) { }
      })
    }
  }

  favourite() {
    var user_data = new FormData()
    user_data.append("id", this._user.id)
    user_data.append("token", this._user.token)
    if (this._user.social != null) {
      user_data.append('authToken', this._user.social['authToken'])
      user_data.append('idToken', this._user.social['idToken'])
      user_data.append("origin", this._user.social['provider'])
    } else {
      user_data.append("origin", 'mix')
    }
    user_data.append('eventid', this.data.eventid.toString())
    user_data.append('mode', 'set')
    user_data.append('add', (!this.favourited.getValue()).toString())
    this._subs.sink = this._api.sendTerminePin(user_data).subscribe(data => {
      this.favourited.next(data.response === 'created')
      if (data.response === 'created') this._user.merkliste_total.next(this._user.merkliste_total.getValue() + 1)
      if (data.response === 'deleted') this._user.merkliste_total.next(this._user.merkliste_total.getValue() - 1)
      if (data.response.startsWith('EX')) {
        this._tools.alert(this._translate.instant("termine_details.alert1"), 'Du willst anderen zeigen, dass Du bei dieser Veranstaltung dabei bist? Dann <span class="alert-link">klicke bitte zuerst hier</span>, um Dich anzumelden.', '', 'OK');
        setTimeout(_ => {
          try {
            document.querySelector('.alert-link').addEventListener('click', () => {
              (document.querySelector('.head_icon.user_container') as HTMLElement).click();
              this.dialogRef.close();
              (document.querySelector('.alert-box') as HTMLElement).style.display = 'none';
            })
          } catch (err) { }
        })
        this._tools.alert(this._translate.instant("termine_details.alert1"), this._translate.instant("termine_details.error_merkliste"), '', 'Ok');
      }
    })
  }

  iWillAttend() {
    var user_data = new FormData()
    user_data.append("id", this._user.id)
    user_data.append("token", this._user.token)
    if (this._user.social != null) {
      user_data.append('authToken', this._user.social['authToken'])
      user_data.append('idToken', this._user.social['idToken'])
      user_data.append("origin", this._user.social['provider'])
    } else {
      user_data.append("origin", 'mix')
    }
    user_data.append('eventid', this.data.eventid.toString())
    user_data.append('mode', 'set')
    user_data.append('add', (!this.attended.getValue()).toString())
    this._subs.sink = this._api.sendAssistance(user_data).subscribe(data => {
      this.attended.next(data['response'] === 'assistance saved')
      if (data.response.startsWith('EX')) {
        this._tools.alert(this._translate.instant("termine_details.alert1"), this._translate.instant("termine_details.error_merkliste"), '', 'Ok');
      }
    })
  }

  myColor = 'rgba(0,0,0,.02)'

  mailUrl
  whatsappUrl

  link

  shareOnFacebook(): void {
    const event = this.data
    const vHeight = (window.innerHeight / 3).toFixed(0)
    const vWidth = (window.innerWidth / 3).toFixed(0)
    const fbWindow = window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.link)}`, event.titel, `height=${vHeight},width=${vWidth}`);
    if (fbWindow.focus) fbWindow.focus()
  }

  copyUrl() {
    if (this._clipboard.copyFromContent(this.link)) {
      this._snack.open('Link kopiert!', '', { duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'center', panelClass: 'copied-link' })
    }
  }
}
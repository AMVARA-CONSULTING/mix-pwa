import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { ToolsService, safeClearStorage } from '@services/tools.service';
import { UserService } from '@services/user.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { InfoService } from '@services/info.service';

declare const Bowser: any

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImpressumComponent implements OnInit {
  display = new BehaviorSubject<boolean>(false)
  impressum = new BehaviorSubject<any>(null)
  folder = new BehaviorSubject<string>('none')
  userAgent = navigator.userAgent;
  contactMix = new BehaviorSubject<boolean>(false)
  emailToContact = new BehaviorSubject<string>('')
  browser = new BehaviorSubject<string>('')
  browserName = new BehaviorSubject<string>('')
  browserVersion = new BehaviorSubject<string>('')

  constructor(
    private api: ApiService,
    public globals: GlobalsService,
    private _tools: ToolsService,
    private _user: UserService,
    private _http: HttpClient,
    public _info: InfoService
  ) {
    const browser = Bowser.getParser(window.navigator.userAgent)
    const browserName = browser.getBrowserName()
    const browserVersion = browser.getBrowserVersion()
    this.browserName.next(browserName)
    this.browser.next(window.navigator.userAgent)
    this.browserVersion.next(browserVersion)
    this.api.getImpressum().subscribe(
      data => {
        this.impressum.next(data)
        this.checkImpressum(this.impressum)
      })
  }
  checkImpressum(data) {
    if ((typeof data != 'object')) {
    }
    else {
      this.display.next(true)
    }
  }

  clear() {
    safeClearStorage()
    this._tools.clearCookies()
    this._user.signOut()
    this.globals.settings_page.next(false)
    const rand = Math.floor((Math.random() * 999999) + 1);
    this._http.get(`${location.origin}/index.html?v=${rand}`, { responseType:'text' }).subscribe(_ => {
      this._tools.alert('MIX geht mehr!', 'Deine Cookies und der LocalStorage wurden erfolgreich gelöscht', 'Ok', '')
    }, (err: HttpErrorResponse) => {
      if (err.status === 200) {
        this._tools.alert('MIX geht mehr!', 'Deine Cookies und der LocalStorage wurden erfolgreich gelöscht', 'Ok', '')
      }
    }, () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for ( let registration of registrations ) {
            registration.unregister()
          }
        })
      }
    })
  }

  setFolder(name) {
    if (this.folder.getValue() == name) this.folder.next('none')
    else this.folder.next(name)
  }
  ngOnInit() {

  }
  sendEdit($event, name, groupe) {
    this.api.saveEdit($event, name, groupe)
    this.display.next(false)
    setTimeout(() => {
      this.api.getImpressum().subscribe(
        data => this.impressum.next(data))
      this.display.next(true)
    }, 100);
  }

  scrollKat() {
    if (!this._tools.isAppleDevice()) {
      setTimeout(() => {
        var reference = document.getElementsByClassName("reference");
        if (reference.length != 0) {
          reference[0].scrollIntoView({ block: "start", behavior: "smooth" });
        }
      }, 200);
    }
  }


  pushHistory() {
    var stateObj = { foo: window.location.href };
    history.pushState(stateObj, "page 2", window.location.href);
  }
}

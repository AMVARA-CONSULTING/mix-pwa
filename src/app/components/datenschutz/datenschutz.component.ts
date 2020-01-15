import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import {ApiService} from '@services/api.service';
import { BehaviorSubject } from 'rxjs';
import { ToolsService, safeClearStorage, SubSink } from '@services/tools.service';
import { UserService } from '@services/user.service';
import { GlobalsService } from '@services/globals.service';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-datenschutz',
  templateUrl: './datenschutz.component.html',
  styleUrls: ['./datenschutz.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class DatenschutzComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  daten:BehaviorSubject<string>=new BehaviorSubject<string>('')

  constructor(
    private api: ApiService,
    private _tools: ToolsService,
    private _user: UserService,
    private _globals: GlobalsService,
    private _http: HttpClient
  ) { }

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  ngOnInit() {
    this._subs.sink = this.api.getDatenschutz().subscribe(data => this.daten.next(data))
  }

  clear() {
    safeClearStorage()
    this._tools.clearCookies()
    this._user.signOut()
    this._globals.settings_page.next(false)
    const rand = Math.floor((Math.random() * 999999) + 1);
    this._http.get(`${location.origin}/index.html?v=${rand}`, { responseType: 'text' }).subscribe(_ => {
      this._tools.alert('MIX geht mehr!', 'Deine Cookies und der LocalStorage wurden erfolgreich gelöscht', 'Ok', '')
    }, (err: HttpErrorResponse) => {
      if (err.status === 200) {
        this._tools.alert('MIX geht mehr!', 'Deine Cookies und der LocalStorage wurden erfolgreich gelöscht', 'Ok', '')
      }
    })
  }

}

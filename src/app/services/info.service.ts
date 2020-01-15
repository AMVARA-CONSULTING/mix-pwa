import { Injectable, Inject } from '@angular/core';
import { GenericInfo, CaptchaResponse, ConfigInfo } from '@other/interfaces';
import { tap } from 'rxjs/internal/operators/tap';
import { HttpClient } from '@angular/common/http';
import { ToolsService, safeGetStorageItem, safeSetStorageItem, safeClearStorage } from './tools.service';
import { API_URL } from 'app/tokens';
import { environment } from '@environments/environment';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

declare const dayjs: any

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  constructor(
    private _http: HttpClient,
    private _tools: ToolsService,
    @Inject(API_URL) private api_url: string
  ) { }

  serverInfo: GenericInfo

  captcha_required = false

  config: ConfigInfo

  clearStorage() {
    safeClearStorage()
    this._tools.clearCookies()
    this._tools.log('[Server]', 'Clear localStorage & Cookies', 'Cleaned!')
  }

  getGenericServerInfo(): Promise<any> {
    return forkJoin(
      this._http.get<GenericInfo>(`${this.api_url}data/mix20_generic_rest_api.php`).pipe(
        tap(info => {
          if (!environment.production) {
            this._tools.log("[AppComponent]", "Server Status", info)
          }
          this.serverInfo = info
          // Make sure the red info box is only showed once a day
          const show_info_box_date = safeGetStorageItem('info_box_date')
          const info_box_text = safeGetStorageItem('info_box_text')
          if (show_info_box_date) {
            const date = dayjs(show_info_box_date, 'YYYY-MM-DD')
            if (dayjs().diff(date, 'day') == 0 && info_box_text == this.serverInfo.info_box) {
              // this.serverInfo.info_box_enable = false
            } else {
              safeSetStorageItem('info_box_date', dayjs().format('YYYY-MM-DD'), true)
              safeSetStorageItem('info_box_text', this.serverInfo.info_box, true)
            }
          } else {
            safeSetStorageItem('info_box_date', dayjs().format('YYYY-MM-DD'), true)
          }
          if (info.clearStorage) {
                    const timestamp_local = safeGetStorageItem('clearStorageTimestamp')
                    if (timestamp_local && dayjs(timestamp_local, 'YYYY-MM-DD HH:mm:ss').isValid()) {
                              const timestamp_local_parsed = dayjs(timestamp_local, 'YYYY-MM-DD HH:mm:ss')
                              const timestamp_new_parsed = dayjs(info.clearStorageTimestamp, 'YYYY-MM-DD HH:mm:ss')
                              if (timestamp_new_parsed.isAfter(timestamp_local_parsed)) {
                                        this.clearStorage()
                                        safeSetStorageItem('clearStorageTimestamp', info.clearStorageTimestamp)
                                        if ('serviceWorker' in navigator) {
                                                  caches.keys().then(function(cacheNames) {
                                                            cacheNames.forEach(function(cacheName) {
                                                                      caches.delete(cacheName);
                                                            });
                                                            location.reload()
                                                  });
                                        }
                              }
                    } else {
                              this.clearStorage()
                              safeSetStorageItem('clearStorageTimestamp', info.clearStorageTimestamp)
                    }
          }
        })
      ),
      this._http.get<CaptchaResponse>(`${this.api_url}data/kazen/captcha.php`).pipe(
        tap(info => {
          this.captcha_required = info.required
          // this._tools.log('[Server]', 'Captcha Required', info.required)
        })
      ),
      this._http.get<ConfigInfo>(`assets/config.json`).pipe(
        tap(info => {
          this.config = info
          if (!environment.production) {
            this._tools.log('[Server]', 'Config', info)
          }
        })
      )
    ).toPromise()
  }
}

import { Component, AfterContentChecked, ChangeDetectorRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { safeGetStorageItem, safeSetStorageItem, ToolsService } from '@services/tools.service';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackPromptDialog } from 'app/dialogs/feedback-prompt/feedback-prompt.dialog';
import { FeedbackDialog } from 'app/dialogs/feedback/feedback.dialog';
import { BannerService } from '@services/banner.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { TermineDetailFlagDialog } from '@dialogs/termine-detail-flag/termine-detail-flag.dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { interval } from 'rxjs/internal/observable/interval';

@Component({
  selector: 'mix-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'appPromptAnimation', [
        transition(':enter', [
          style({transform: 'translate3d(0, 100px, 0)', opacity: 0}),
          animate('300ms 200ms', style({transform: 'translate3d(0, 0, 0)', opacity: 1})),
          animate('300ms 10s', style({transform: 'translate3d(0, 100px, 0)', opacity: 0}))
        ]),
      ]
    )
  ]
})
export class AppComponent implements AfterContentChecked, OnInit {

  ngAfterContentChecked() {
    this._cdr.detectChanges()
  }

  iosAppInstall = new BehaviorSubject<boolean>(false)

  constructor(
    public globals: GlobalsService,
    public router: Router,
    private _translate: TranslateService,
    private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _banner: BannerService,
    private _tools: ToolsService
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    this._translate.setDefaultLang('de');
    this._banner.getBanners()
    let detail_flag_counter = safeGetStorageItem('detail_flag_counter', true)
    let detail_flag_counter_number = 0
    if (detail_flag_counter != null) {
      detail_flag_counter_number = parseInt(detail_flag_counter)
    }
    if (detail_flag_counter_number < 3 && (screen.availHeight != 548 && screen.availWidth != 320)) {
      let dialog = this._dialog.open(TermineDetailFlagDialog, { autoFocus: false })
      dialog.afterClosed().subscribe(_ => {
        detail_flag_counter_number++
        safeSetStorageItem('detail_flag_counter', detail_flag_counter_number.toString(), true)
      })
    }
    let ios_app_install_counter = safeGetStorageItem('ios_app_install_counter', true)
    let ios_app_install_counter_number = 0
    if (ios_app_install_counter != null) {
      ios_app_install_counter_number = parseInt(ios_app_install_counter)
    }
    if (ios_app_install_counter_number < 5) {
      if (this._tools.isIOS() && !this._tools.isInStandaloneMode()) this.iosAppInstall.next(true)
    }

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this._translate.use('de');
    try {
      if (this.iOSversion()[0] <= 10 && safeGetStorageItem('cookies') !== 'agree') {
        this.globals.previousRoute = window.location.pathname
        // this.router.navigate(['/marktplatz'])
      }
    } catch (err) { }

    // Feedback dialog
    let visitCounter = +safeGetStorageItem('visit') || 0
    if (visitCounter !== 0 && visitCounter % 60 === 0 && visitCounter / 60 < 3) {
      // Show dialog
      let dialogRef = this._dialog.open(FeedbackPromptDialog, { autoFocus: false, disableClose: true })
      dialogRef.afterClosed().subscribe(accept => {
        if (accept) {
          // User has accepted giving feedback
          let feedbackRef = this._dialog.open(FeedbackDialog, { autoFocus: false, disableClose: true, maxWidth: '95vw' })
          feedbackRef.afterClosed().subscribe(sended => {
            if (sended) {
              // User has sended feedback
              visitCounter++
              safeSetStorageItem('visit', visitCounter.toString())
            } else {
              safeSetStorageItem('visit', visitCounter.toString())
            }
          })
        } else {
          visitCounter++
          safeSetStorageItem('visit', visitCounter.toString())
        }
      })
    } else {
      visitCounter++
      safeSetStorageItem('visit', visitCounter.toString())
    }
  }

  preload(...args) {
    for (let i = 0; i < args.length; i++) {
      this.images[i] = new Image()
      this.images[i].src = args[i]
    }
  }

  images = new Array()

  ngOnInit() {
    if (navigator.userAgent.indexOf("Edge") > -1) {
      if ('serviceWorker' in navigator) {
        interval(1000).subscribe(_ => {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            for ( let registration of registrations ) {
              registration.unregister()
            }
          })
        })
      }
    }
    // Preload SVG Images
    this.preload(
      "assets/images/danger.svg",
      "assets/images/MIXICON_Back.svg",
      "assets/images/upload.svg",
      "assets/images/MIXICON_Back_white.svg",
      "assets/images/MIXICON_Close.svg",
      "assets/images/MIXICON_Close2.svg",
      "assets/images/document.svg",
      "assets/images/termine/mix-icon-dotsmenu_margin.svg",
      "assets/images/header/merkliste/mix-icon-heart_outline_black_not_logged.svg",
      "assets/images/header/merkliste/mix-icon-heart_outline_black_logged.svg",
      "assets/images/header/merkliste/mix-icon-heart_outline_black_in_page.svg",
      "assets/images/mix_icon_search_F.svg",
      "assets/images/MIXICON_Sandwich.svg",
      "assets/images/header/user/mix_icon_user_F_not_logged.svg",
      "assets/images/header/user/mix_icon_user_F_logged.svg",
      "assets/images/header/user/mix_icon_user_F_logging.svg",
      "assets/images/header/user/mix_icon_user_F_in_page.svg",
      "assets/images/close_detail.svg",
      "assets/images/MIXICON_AddFile_Red.svg",
      "assets/images/MIXICON_Send.svg",
      "assets/images/MIX_ICON_Heart.svg",
      "assets/images/mix-icon-heart_red.svg",
      "assets/images/MIXICON_Delete.svg",
      "assets/images/detail/mix-icon-assistants1_red.svg",
      "assets/images/MIXICON_arrow_grey.svg",
      "assets/social/MIXICON_Mix_Imag.svg",
      "assets/images/MIXICON_AnsPic_Red.svg",
      "assets/images/MIXICON_Ans_List.svg",
      "assets/images/MIXICON_Ans_Hour.svg",
      "assets/images/MIXICON_Ans_Local.svg",
      "assets/images/MIXICON_Ansicht.svg?a"
    )
  }

  closeMenu(): void {
    this.globals.menu.next(false)
  }

  iOSversion() {
    if (/iP(hone|od|ad)/.test(navigator.platform)) {
      // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
      var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
      // @ts-ignore
      return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
    }
  }

  removeAlert() {
    (document.querySelector('.alert-box') as HTMLElement).style.display = ''
  }
}

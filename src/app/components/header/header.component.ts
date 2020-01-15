import { Component, OnInit, Output, EventEmitter, ElementRef, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { UserService } from '@services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from "angularx-social-login";
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { safeSetStorageItem, safeGetStorageItem } from '@services/tools.service';

@Component({
  selector: 'mix-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  search_status: boolean = false
  public elementRef;

  isIconOutside = new BehaviorSubject<boolean>(false)

  @Output() search: EventEmitter<any> = new EventEmitter<any>();

  checkSelect(text: string) {
    return text == window.location.href.split("/")[3]
  }

  constructor(
    public translate: TranslateService,
    public api: ApiService,
    public globals: GlobalsService,
    public router: Router,
    private eRef: ElementRef,
    private authService: AuthService,
    public user: UserService
  ) {
    this.elementRef = this.eRef
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const outUrls = ['/marktplatz', '/kontakte']
        this.isIconOutside.next(outUrls.indexOf(this.router.url) > -1)
      }
    })
  }

  goRoute(route) {
    this.router.navigate([route])
  }

  ngOnInit() {
    this.globals.checkBrowser()
    this.authService.authState.subscribe((user) => {
      this.user.social = user;
      if (this.user.social != null) {
        this.user.sendSocial()
      } else if (safeGetStorageItem('session_token') != null) {
        this.user.sendLocalMix()
      }
    })
    if (safeGetStorageItem('session_token') != null) this.user.sendLocalMix()
  }

  sidenavOpen = new BehaviorSubject<boolean>(false)

  checkLogged() {
    if ((this.user.logged_in == true)) {
      if (this.user.social != null) {
        this.user.sendSocial()
      } else {
        this.user.sendLocalMix()
      }
    }
  }
  account() {
    if (this.user.logged_in == true) {
      if (this.globals.settings_page.getValue()) {
        this.globals.settings_page.next(false)
        this.backHistory()
      } else {
        this.globals.settings_page.next(true)
        this.pushHistory()
      }
    }

  }
  searchBar() {
    this.globals.search.next(!this.globals.search.getValue())
    if (!this.globals.search.getValue()) this.globals.search_focus = false
  }

  closeSidebar() {
    this.globals.menu.next(false)
    this.globals.login_page.next(false)
    this.globals.settings_page.next(false)
    this.globals.merkliste_page.next(false)
  }

  clickOnTermine() {
    this.globals.picture_fullscreen = false
    this.globals.mobile_keyboard = false
  }

  clickOnMenu() {
    this.globals.login_page.next(false)
    this.globals.settings_page.next(false)
    this.globals.merkliste_page.next(false)
  }

  clickOnLogo() {
    safeSetStorageItem('rubrik_list','');
    this.globals.resetTermineView.next()
    this.router.navigate(['/termine', 'main'], { queryParams: { screen: 'welcome' } } )
  }

  clickOnAnsichtItem() {
    this.router.navigate(['/termine', 'main'], { queryParams: { screen: 'ansicht' } } )
  }

  toggleMenu() {
    this.globals.menu.next(!this.globals.menu.getValue())
  }

  checkLoginPage() {
    if ((!this.globals.login_page.getValue()) && (this.user.logged_in == false)) {
      this.globals.login_page.next(true)
      this.pushHistory()
    }
    else {
      this.globals.login_page.next(false)
      if (this.user.logged_in == false) this.backHistory()
    }
  }

  checkMerkliste() {
    if (this.user.logged_in) {
      if (this.globals.merkliste_page.getValue()) {
        this.globals.merkliste_page.next(false)
        this.backHistory()
      }
      else {
        this.globals.merkliste_page.next(true)
        this.pushHistory()
      }
    }
    else {
      this.globals.merkliste_page.next(false)
      this.showAlert("MIX für ungut!", "Melde Dich bitte zuerst an, um Termine oder Kontakt- bzw. Marktplatz-Anzeigen auf Deine Merkliste zu setzen. Wenn Du <span class='alert-link'>hier klickst</span>, kannst Du Dich einloggen.");
      setTimeout(_ => {
        try {
          document.querySelector('.alert-link').addEventListener('click', () => {
            (document.querySelector('.head_icon.user_container') as HTMLElement).click();
            this.alert.next(false)
          })
        } catch (err) { }
      })
    }
  }

  @HostListener('window:popstate', ['$event'])
  onBack(event?) {
    if (this.globals.menu.getValue()) {
      setTimeout(() => {
        this.globals.menu.next(false)
      }, 100);

    }
  }
  pushHistory() {
    var stateObj = { foo: window.location.href };
    history.pushState(stateObj, "page 2", window.location.href);
  }
  backHistory() {
    window.history.back();
  }
  waiting: boolean = false;
  alert = new BehaviorSubject<boolean>(false)
  pre_alert_message = new BehaviorSubject<string>('')
  message_alert = new BehaviorSubject<string>('')
  simple_alert = new BehaviorSubject<boolean>(false)
  showAlert(pre_alert, message) {
    this.alert.next(true)
    this.pre_alert_message.next(pre_alert)
    this.message_alert.next(message)
    this.waiting = true
  }
  removeAlert() {
    this.alert.next(false)
    this.simple_alert.next(false)
    this.pre_alert_message.next('')
    this.message_alert.next('')
    this.waiting = false
  }
}

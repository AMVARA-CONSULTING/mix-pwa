import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Subject } from 'rxjs';
import { GenericInfo } from '@other/interfaces';
import { skip } from 'rxjs/internal/operators/skip';
import { safeGetStorageItem } from './tools.service';


@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  no_results = new BehaviorSubject<boolean>(false)
  isIconTermine = new BehaviorSubject<boolean>(false)
  edit_mode: boolean = false;  //edit mode is enabled (the red bar shows at the left)
  editing: boolean = false;   //edit on the edit bar is pressed you enter editing mode
  language: string = 'de';
  menu = new BehaviorSubject<boolean>(false)
  search = new BehaviorSubject<boolean>(true)
  search_focus: boolean = true;
  user_agent: string;
  user_agent_version: string;
  dark: boolean = false;
  ios: string;
  sidenavOpen = new BehaviorSubject<boolean>(false)
  showSearchIcon = new BehaviorSubject<boolean>(false)
  menu_inside_body_open: boolean = false;
  selected_random_image: any[] = [];
  mobile_keyboard: boolean = false;
  picture_fullscreen: boolean = false;
  login_page = new BehaviorSubject<boolean>(false)
  merkliste_page = new BehaviorSubject<boolean>(false)
  settings_page = new BehaviorSubject<boolean>(false)
  fullscreen_print: boolean = false;
  previousRoute: string = ''
  searchEmpty = new BehaviorSubject<boolean>(false) // Used for filter search pipe
  resetTermineView = new Subject()
  constructor(
    private router: Router,
    private _ac: ActivatedRoute
  ) {
    this.cookiesObserver.next(safeGetStorageItem('cookies') === 'agree')
    this.router.events.subscribe(Event => {
      if (Event instanceof NavigationEnd) {
        // this.search.next(false)
        this.search_focus = false
        this.picture_fullscreen = false
        this.login_page.next(false)
        this.settings_page.next(false)
        this.merkliste_page.next(false)
        this.menu.next(false)
        this.termine_pin_deleted = -1
        this.exited_merkliste = false
        this.showSearchIcon.next(this._ac.root.firstChild.snapshot.data['searchIcon'])
      }
    });
  }

  // cookieObserver stores the click_agree
  cookiesObserver = new BehaviorSubject<boolean>(false)

  // cookieObserverClickedNotAgree stores the not agreed click 
  // ... this is false per default and changes to true on click, but is never stored
  // ... and can be reset to false anytime to show the window again
  cookieObserverClickedNotAgree = new BehaviorSubject<boolean>(false)

  first_search: boolean = true;
  first_kaz_search: boolean = true;
  termine_pin_deleted: Number = -1;
  exited_merkliste = false
  banners_loaded = new BehaviorSubject<boolean>(false)
  localStorage: boolean = (safeGetStorageItem('cookies') == 'agree');
  mac: boolean = false;
  checkBrowser() {
    var ua = navigator.userAgent;
    //ua = navigator.userAgent;
    var b;
    var browser;
    if (ua.indexOf("Opera") != -1) {
      b = browser = "Opera";
    }
    if (ua.indexOf("Firefox") != -1 && ua.indexOf("Opera") == -1) {
      b = browser = "Firefox";
      // Opera may also contains Firefox
    }
    if (ua.indexOf("Chrome") != -1) {
      b = browser = "Chrome";
    }
    if (ua.indexOf("Safari") != -1 && ua.indexOf("Chrome") == -1) {
      b = browser = "Safari";
      // Chrome always contains Safari
    }
    if (ua.indexOf("MSIE") != -1 && (ua.indexOf("Opera") == -1 && ua.indexOf("Trident") == -1)) {
      b = "MSIE";
      browser = "Internet Explorer";
      //user agent with MSIE and Opera or MSIE and Trident may exist.
    }
    if (ua.indexOf("Macintosh;") != -1) {
      this.mac = true;
      // Opera may also contains Firefox
    }
    if (ua.indexOf("Trident") != -1) {
      b = "Trident";
      browser = "Internet Explorer";
    }
    var version = ua.match(b + "[ /]+[0-9]+(.[0-9]+)*")[0];
    this.user_agent = navigator.userAgent;
    return version;
  }
  checkSafari() {
    var agent = this.checkBrowser().split("/");
    if ((agent[0] == 'Safari')) {
      this.ios = navigator.userAgent.split("(")[1].split(";")[1].split(" ")[3];
      var ios2 = navigator.userAgent.split("(")[1].split(";")[1].split(" ")[4];
      if ((((parseInt(this.ios.split("_")[0])) < 10) || (((parseInt(this.ios.split("_")[0])) == 10) && (((parseInt(this.ios.split("_")[1])) < 3)))) || (((parseInt(ios2.split("_")[0])) < 10) || (((parseInt(ios2.split("_")[0])) == 10) && (((parseInt(ios2.split("_")[1])) < 3))))) {
        return true;
      }
      return false;
    }
  }
  checkTouchDevice() {
    if (('ontouchstart' in window)) return true
    else return false
  }

  changeBody(hide) {
    if (hide == true) document.getElementsByTagName("body")[0].style.overflow = 'hidden';
    else document.getElementsByTagName("body")[0].style.overflow = 'unset';
  }

  changeUrl(url) {
    this.router.navigateByUrl('/termine/main');
    setTimeout(() => {
      this.router.navigateByUrl(url);
    }, 100);
  }
  updateUrl(url) {
    this.router.navigateByUrl('');
    setTimeout(() => {
      this.router.navigateByUrl(url);
    }, 10);
  }

  checkSafariVer() { //check if safari desktop is old version
    if (this.user_agent.includes('10.1.2 Safari')) {
      return true;
    }
  }
}

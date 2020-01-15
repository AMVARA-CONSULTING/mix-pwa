import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as MobileDetect from 'mobile-detect';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  log(classe: string, type: string, ...args: any[]) {
    if (!environment.production || localStorage.getItem('enable_logs') == 'yes') {
      const texts = []
      const objects = []
      const arrays = []
      args.forEach(arg => {
        if (Array.isArray(arg)) {
          arrays.push(arg)
          return
        }
        if (typeof arg === 'object') {
          objects.push(arg)
          return
        }
        if (typeof arg === 'number') {
          texts.push(arg)
          return
        }
        if (typeof arg === 'string') {
          texts.push(arg)
        }
      })
      console.log(`%c${classe} %c| %c` + type + "%c | " + texts.join(' '), 'color:#1976d2;font-weight:bold;', 'color:#37474f;', 'color:#009688;font-weight:bold;', 'color:auto;', ...objects, ...arrays)
    }
  }

  
  checkRegex(regex, aux) {
    return aux.match(regex) != null
  }

  getTotalTerminePrice(title: string, kurze: string, dates_array: any[]): number {
    const t_zeichen = title.length + 8 + kurze.length
    const t_zeilen = Math.ceil(t_zeichen / 82)
    const t_anztage = dates_array.length
    const t_summe = t_anztage * 5 * (t_zeilen)
    return t_summe
  }

  /**
  * prueft ob die der string eine gueltige email adresse ist
  */
  validmail(s) {
    let a = false;
    let res = false;
    if (typeof (RegExp) == 'function') {
      const b = new RegExp('abc')
      if (b.test('abc') == true) a = true
    }
    if (a == true) {
      const reg = new RegExp('^([a-zA-Z0-9\\-\\.\\_]+)' + '(\\@)([a-zA-Z0-9\\-\\.]+)' + '(\\.)([a-zA-Z]{2,4})$')
      res = (reg.test(s))
    } else {
      res = (s.search('@') >= 1 && s.lastIndexOf('.') > s.search('@') && s.lastIndexOf('.') >= s.length - 5)
    }
    return (res)
  }

  /**
   * Description: Check if the passed text isn't completely uppercase or lowercase, and make sure words between can be case-insensitive
   *
   * @param str Text to check
   * @link  https://www.mix-online.de/2010/termin_coupon_2014.js
   */
  mixCamelCase(str): boolean {
    const temp_gross = str.toUpperCase()
    const temp_klein = str.toLowerCase()
    if (!str) return true
    if (str === temp_gross) return false
    if (str === temp_klein) return false
    let Woerter = str.split(" ")
    let Zeichen = ""
    let gb_flag = 0
    for (let i = 0; i < Woerter.length; ++i) {
      gb_flag = 0
      for (let ii = 0; ii < Woerter[i].length; ii++) {
        Zeichen = Woerter[i].substr(ii, 1)
        if (Zeichen.charCodeAt(0) >= 65 && Zeichen.charCodeAt(0) <= 90) {
          if (gb_flag === 4) return false
          gb_flag++
        } else {
          gb_flag = 0
        }
      }
    }
    return true
  }

  isIE() {
    var ua = window.navigator.userAgent
    var msie = ua.indexOf("MSIE ")
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) return true
    return false
  }

  clearCookies(): void {
    const cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  }

  isAppleDevice(): boolean {
    return /Mac|iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  }

  toggleFullScreen(): boolean {
    // @ts-ignore
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
      // @ts-ignore
      if (document.cancelFullScreen) {
        // @ts-ignore
        document.cancelFullScreen();
      } else {
        // @ts-ignore
        if (document.mozCancelFullScreen) {
          // @ts-ignore
          document.mozCancelFullScreen();
        } else {
          // @ts-ignore
          if (document.webkitCancelFullScreen) {
            // @ts-ignore
              document.webkitCancelFullScreen();
          }
        }
      }
      return false
    } else {
      const _element = document.documentElement;
      if (_element.requestFullscreen) {
          _element.requestFullscreen();
      } else {
        // @ts-ignore
        if (_element.mozRequestFullScreen) {
          // @ts-ignore
          _element.mozRequestFullScreen();
        } else {
          // @ts-ignore
          if (_element.webkitRequestFullscreen) {
            // @ts-ignore
              _element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        }
      }
      return true
    }
  }

  isMobile(): boolean {
    var check = false;
    // @ts-ignore
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }

  /**
   * Description: Displays a customized alert box contained in app.component.html with customizable options. See below
   *
   * @param title Title of the alert box (accepts HTML Markup)
   * @param text Text of the alert box (accepts HTML Markup)
   * @param acceptText Text of the Ok button
   * @param cancelText Text of the cancel button
   */
  alert(title: string, text: string, acceptText?: string, cancelText?: string): void {
    (document.querySelector('.cm-custom-alert') as HTMLElement).innerHTML = title;
    (document.querySelector('.cm-custom-text') as HTMLElement).innerHTML = text;
    if (acceptText) {
      (document.querySelector('.cm-custom-accept') as HTMLElement).innerHTML = acceptText;
      (document.querySelector('.cm-custom-accept') as HTMLElement).style.display = 'block';
    } else {
      (document.querySelector('.cm-custom-accept') as HTMLElement).style.display = 'none';
    }
    if (cancelText) {
      (document.querySelector('.cm-custom-cancel') as HTMLElement).innerHTML = cancelText;
      (document.querySelector('.cm-custom-cancel') as HTMLElement).style.display = 'block';
    } else {
      (document.querySelector('.cm-custom-cancel') as HTMLElement).style.display = 'none';
    }
    (document.querySelector('.alert-box') as HTMLElement).style.display = 'block'
  }

  // Detects if device is in standalone mode
  isInStandaloneMode(): boolean {
    // @ts-ignore
    return 'standalone' in window.navigator && window.navigator.standalone
  }

  sanitizeAufgebenTextField(text: string | null): string | null {
    return text && encodeURIComponent(text.replace(/\“|\„|\«|\»/g, '"').replace(/\t/g, ''))
  }

  isDetailMobile(): boolean {
    const mediaQueries = window.hasOwnProperty('orientation') ?
          (window.orientation === 0 ? window.innerWidth < 800 : false) :
          window.innerWidth < 800
    const mobileDetector = new MobileDetect(window.navigator.userAgent)
    const isIpad13Portrait = (((navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !(window as any).MSStream && window.orientation === 0)
    const isTabletPortrait = window.orientation === 0 && !!mobileDetector.tablet()
    const isMobile = !!mobileDetector.phone()
    return mediaQueries || isMobile || isTabletPortrait || isIpad13Portrait
  }
  
}

declare const dayjs: any

export function sortByMonth(a: string, b: string) {
	return dayjs(a, { locale: 'deutschAufgebenMarktplatz', format: 'MMM' }).month() - dayjs(b, { locale: 'deutschAufgebenMarktplatz', format: 'MMM' }).month()
}

// Outside exported functions

export function safeGetStorageItem(key: string, ignoreCookies: boolean = false): string {
  try {
    if (ignoreCookies) return localStorage.getItem(key)
    return localStorage.getItem('cookies') == 'agree' && localStorage.getItem(key)
  } catch (err) {
    return null
  }
}

export function safeClearStorage(): void {
  try {
    localStorage.clear()
  } catch (err) { }
}

export function safeSetStorageItem(key: string, value: string, ignoreCookies: boolean = false): void {
  // Exceptions when setting storage keys
  const keysExceptions = ['cookies', 'clearStorageTimestamp']
  try {
    if (ignoreCookies) return localStorage.setItem(key, value);
    (localStorage.getItem('cookies') == 'agree' || keysExceptions.indexOf(key) > -1) && localStorage.setItem(key, value)
  } catch (err) { }
}

export function safeRemoveStorageItem(key: string) {
  try {
    localStorage.removeItem(key)
  } catch (err) { }
}

export function getApiUrl() {
  let protocol = location.protocol
  let host = location.hostname
  
  // Get the HTTP/HTTPS protocol from localStorage if set
  if (safeGetStorageItem('http_protocol', true)) {
    protocol = safeGetStorageItem('http_protocol', true)+':'
  }
  let port = null
  let api_dir = '/'
  
  // Get the HTTP/HTTPS protocol from localStorage if set
  if (safeGetStorageItem('port', true)) {
    port = safeGetStorageItem('port', true)
  }
  
  // Get the API URL from localStorage if set
  if (safeGetStorageItem('api_url', true)) {
    host = safeGetStorageItem('api_url', true)
  }
  if (location.port != '8087') {
    api_dir = '/v1/'
  }

  if (port) {
    return `${protocol}//${host}:${port}${api_dir}`
  }
  return `${protocol}//${host}${api_dir}`
}

const isFunction = (fn: any) => typeof fn === 'function';

export interface SubscriptionLike {
  unsubscribe(): void;
}

/**
 * Subscription sink that holds Observable subscriptions
 * until you call unsubscribe on it in ngOnDestroy.
 */
export class SubSink {

  protected _subs: SubscriptionLike[] = [];

  /**
   * Subscription sink that holds Observable subscriptions
   * until you call unsubscribe on it in ngOnDestroy.
   *
   * @example
   * In Angular:
   * ```
   *   private subs = new SubSink();
   *   ...
   *   this.subs.sink = observable$.subscribe(
   *   this.subs.add(observable$.subscribe(...));
   *   ...
   *   ngOnDestroy() {
   *     this.subs.unsubscribe();
   *   }
   * ```
   */
  constructor() {}

  /**
   * Add subscriptions to the tracked subscriptions
   * @example
   *  this.subs.add(observable$.subscribe(...));
   */
  add(...subscriptions: SubscriptionLike[]) {
    this._subs = this._subs.concat(subscriptions);
  }

  /**
   * Assign subscription to this sink to add it to the tracked subscriptions
   * @example
   *  this.subs.sink = observable$.subscribe(...);
   */
  set sink(subscription: SubscriptionLike) {
    this._subs.push(subscription);
  }

  /**
   * Unsubscribe to all subscriptions in ngOnDestroy()
   * @example
   *   ngOnDestroy() {
   *     this.subs.unsubscribe();
   *   }
   */
  unsubscribe() {
    this._subs.forEach(sub => sub && isFunction(sub.unsubscribe) && sub.unsubscribe());
    this._subs = [];
  }
}
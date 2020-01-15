import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { safeSetStorageItem, safeGetStorageItem } from '@services/tools.service';

/*
if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
          registration.unregister()
          }
          caches.keys().then(function (cachesNames) {
          return Promise.all(cachesNames.map(function (cacheName) {
          return caches.delete(cacheName);
          }))
          }).then(function () {
          console.log("All " + document.defaultView.location.origin + " caches are deleted");
          });
          })
}
*/

if (location.hostname.indexOf('192') > -1 || location.hostname.indexOf('localhost') > -1 || location.hostname.indexOf('bs-local') > -1 ) {
  if (!safeGetStorageItem('http_protocol')) safeSetStorageItem('http_protocol', 'https');
  if (!safeGetStorageItem('api_url')) safeSetStorageItem('api_url', 'mix-online.de');
  if (!safeGetStorageItem('cookies')) safeSetStorageItem('cookies', 'agree');
}

if (location.port == '8087' ) {
  if (!safeGetStorageItem('http_protocol')) safeSetStorageItem('http_protocol', 'http');
  if (!safeGetStorageItem('api_url')) safeSetStorageItem('api_url', '127.0.0.1');
  if (!safeGetStorageItem('port')) safeSetStorageItem('port', '8081');
  if (!safeGetStorageItem('cookies')) safeSetStorageItem('cookies', 'agree');
  (window as any).dev = true;
}

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

/**
 * zone.js MUST be imported AFTER AppModule/AppModuleNgFactory, otherwise it will throw
 * error "ZoneAware promise has been overriden" during bootstrapping
 */
import 'zone.js/dist/zone';

import * as Bowser from "bowser"; // TypeScript/

import * as dayjs from'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
import 'dayjs/locale/de'
import { localeDeutschAufgebenMarktplatz } from 'app/de.locale'
dayjs.locale(localeDeutschAufgebenMarktplatz, null, true)
dayjs.locale('de');
(window as any).dayjs = dayjs;
(window as any).moment = dayjs;



if (environment.production) {
  enableProdMode();
}

(window as any).Bowser = Bowser
const browser = Bowser.getParser(window.navigator.userAgent)
const isValidBrowser = browser.satisfies({
  windows: {
    "internet explorer": ">=10"
  },
  macos: {
    safari: ">=6"
  },
  tablet: {
    firefox: ">=5",
    safari: '>=6'
  },
  mobile: {
    safari: '>=6',
    firefox: ">=5",
    'android browser': '>=3.10',
    uc: ">=5",
    'UC Browser': ">=5"
  },
  'UC Browser': ">=5",
  uc: ">=5",
  chrome: ">=20",
  firefox: ">=31",
  opera: ">=20"
})

const excludedCrawlers = [
  'facebot',
  'facebook',
  'googlebot',
  'baidu',
  'msnbot',
  'bingbot',
  'duckduck',
  'teoma',
  'yahoo',
  'yandex'
]

// if (isValidBrowser) {
platformBrowserDynamic().bootstrapModule(AppModule)
.then(() => {
  // Browser agent seems to be compatible with Angular / ES5 JS
  try {
    document.getElementById('old_browser').remove()
  } catch (err) { }
})
.catch(err => {
  // There was an error in the bootstrap process, maybe Angular error or Browser is unsupported
  console.log("Error of bootstrapModule:", err)
  // Check if the Browser should be valid or if the browser is a Crawler
  if (isValidBrowser || excludedCrawlers.some(crawler => navigator.userAgent.indexOf(crawler) > -1)) {
    console.log('Your Browser looks like is supported but there was an error in the bootstrap process. Read the above error for more details')
  } else {
    document.querySelector('mix-root').remove()
    document.getElementById('old_browser').style.display = 'block'
    document.querySelector('.user-agent').textContent = window.navigator.userAgent
  }
})
// } else {
//   document.querySelector('mix-root').remove()
//   document.getElementById('old_browser').style.display = 'block'
//   document.querySelector('.user-agent').textContent = window.navigator.userAgent
// }

// ----
// #1686 - timer to detect day change and fireoff "reload"
// ----
var d = new Date();
var h = d.getHours();
var m = d.getMinutes();
var s = d.getSeconds();

var seconds_until_midnight = (24*60*60) - (h*60*60) - (m*60) - s + 5;

// For testing set actual time near midnight
// if (5==5) {
//   h=23
//   m=59
//   s=50
// }
// console.log("Timeout will be triggered in :", seconds_until_midnight," seconds.")
let daychangeTimerID = setTimeout(
    () => location.reload(),
    seconds_until_midnight * 1000);
// ----

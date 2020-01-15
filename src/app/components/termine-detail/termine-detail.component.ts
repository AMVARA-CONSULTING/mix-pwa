import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Host, HostListener, ViewChild, ApplicationRef, Input, Inject } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, Router } from "@angular/router";
import { DomSanitizer, SafeStyle, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialog } from 'app/dialogs/share/share.dialog';
import { FullscreenDialog } from 'app/dialogs/fullscreen/fullscreen.dialog';
import { AttendDialog } from 'app/dialogs/attend/attend.dialog';
import { Event, EventProvider } from '@other/interfaces';
import { TermineComponent } from '@components/termine/termine.component';
import { ToolsService, SubSink } from '@services/tools.service';
import { MatTooltip } from '@angular/material/tooltip';
import { KinoDatesDialog } from 'app/dialogs/kino-dates/kino-dates.dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { API_URL } from 'app/tokens';
import { EventProvidersDialog } from '@dialogs/event-providers/event-providers.dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { timer } from 'rxjs/internal/observable/timer';
import { map } from 'rxjs/internal/operators/map';
import { filter } from 'rxjs/internal/operators/filter';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'mix-termine-detail',
  templateUrl: './termine-detail.component.html',
  styleUrls: ['./termine-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TermineDetailComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  @Input() event: Event = null

  mac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  selected_event_array = new BehaviorSubject<Event>(null)
  
  isIE: boolean = false
  small: boolean
  display_url: boolean = false
  recommended: boolean = false
  mobile = new BehaviorSubject<boolean>(true)
  kino: boolean = false
  expand_text: boolean = true
  full_view: boolean = false
  image = new BehaviorSubject<number>(0)
  image_max = 5;
  checked: boolean = false;
  assistance = new BehaviorSubject<boolean>(false)
  ticketsAvailable = new BehaviorSubject<boolean>(false)
  assistance_bar: boolean = false;
  user_list: any[] = [];
  no_results: boolean = true;
  attend_message = "";
  total_assistance: number
  old_json: any[] = [];
  trailer_pos = new BehaviorSubject<number>(-1)
  changed: boolean = false;
  url = window.location.href;
  rubrik: String = "Details";
  already_photo: boolean = false;
  display_event: boolean = false;

  constructor(
    @Host() public _termine: TermineComponent, // _termine contains a reference to parent (TermineComponent), there's no need for emitters
    public translate: TranslateService,
    public globals: GlobalsService,
    public api: ApiService,
    private route: ActivatedRoute,
    public router: Router,
    private _sanitizer: DomSanitizer,
    public user: UserService,
    private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _tools: ToolsService,
    private _ref: ApplicationRef,
    private _breakpointObserver: BreakpointObserver,
		@Inject(API_URL) private api_url: string
  ) {
    this.onResize()
    this.isIE = window.navigator.userAgent.indexOf('MSIE ') > -1
    this._subs.sink = this._breakpointObserver.observe([
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]).subscribe(result => {
      if (result.matches) {
        setTimeout(_ => {
          this._termine.onResize()
          this.onResize()
        })
      }
    });
    this._subs.sink = this.image.subscribe(index => {
      if (this.selected_event_array.getValue() !== null) {
        if (this.selected_event_array.getValue().rubrik === 'Kino' && index === 1 ) {
          return 
        }
        const imageSizes = this.getMultidimensionImage(index)
        this.src.next(imageSizes.small)
        this.srcset.next(`${imageSizes.medium} 1024w, ${imageSizes.large} 1920w`)
      }
    })
    this._subs.sink = this.src.subscribe(src => this.IEImage.next(src.replace('/t/', '/').replace('_t.jpg', '_org.jpg')))
    this._subs.sink = this.route.queryParamMap.subscribe(queryParams => this.returnTo = queryParams.get('returnTo'))
  }
  
  IEImage = new BehaviorSubject<string>('')

  returnTo = null

  openAttend() {
    if (this.user.logged_in) {
      let dialogRef = this._dialog.open(AttendDialog, {
        width: '400px',
        data: this.selected_event_array.getValue()
      })
      this._subs.sink = dialogRef.componentInstance.attended.subscribe(attended => {
        if (this.assistance.getValue() !== attended) {
          if (attended) {
            this.total_assistance += 1
          } else {
            this.total_assistance -= 1
          }
        }
        this.assistance.next(dialogRef.componentInstance.attended.getValue())
      })
    } else {
      this._tools.alert(this.translate.instant("termine_details.alert1"), 'Du willst anderen zeigen, dass Du bei dieser Veranstaltung dabei bist? Dann <span class="alert-link">klicke bitte zuerst hier</span>, um Dich anzumelden.', '', 'OK');
      setTimeout(_ => {
        try {
          document.querySelector('.alert-link').addEventListener('click', () => {
            (document.querySelector('.head_icon.user_container') as HTMLElement).click();
            (document.querySelector('.alert-box') as HTMLElement).style.display = 'none';
          })
        } catch (err) { }
      })
    }
  }

  @ViewChild('copyright', { static: false }) copyrightTooltip: MatTooltip

  showCopyright() {
    this.copyrightTooltip.show()
    setTimeout(_ => this.copyrightTooltip.hide(10000))
  }

  lastPosX = 0
  isDragging = false

  timerSubscription: Subscription

  ngOnInit() {
    this.globals.changeBody(true)
    this.timerSubscription = timer(750).subscribe(_ => {
      this._termine.loadingDetail.next(true)
    })
    if (!this.event) {
      this._subs.sink = this.route.paramMap
      .pipe(
        map(params => params.get('id').toString()),
        filter(id => id != 'main'),
        map(param => ({ hashid: param.split('-')[0], sessionid: param.split('-')[1] }))
      )
      .subscribe(({ hashid, sessionid }) => {
        // Try getting event data from hashid (with exact date)
        this._subs.sink = this.api.getSingleEvent(hashid).subscribe(data => {
          if (Object.keys(data).length === 0) {
            // Event data was not found
            // Try using sessionid instead (with nearest date)
            this._subs.sink = this.api.getSingleEvent(sessionid).subscribe(data => {
              // Event date found using sessionid, the hashid probably expired
              if (Object.keys(data).length === 0) {
                this.cancelTimer()
                this.error()
                return
              } else {
                this.cancelTimer()
                this.rollup(data)
              }
            })
          } else {
            // Event data is OK
            this.cancelTimer()
            this.rollup(data)
          }
        })
      }, error => this.cancelTimer())
    } else {
      this.cancelTimer()
      this.rollup(this.event)
    }
  }

  cancelTimer() {
    this.timerSubscription.unsubscribe()
    this._termine.loadingDetail.next(false)
  }

  error() {
    this._tools.alert(this.translate.instant("user_errors.sorry"), this.translate.instant("detail_error.no_exist"), '', 'Ok')
    this._termine.loading.next(false)
    this.router.navigate(['/termine/main'], { replaceUrl: true })
    return
  }

  rollup(data: Event) {
    this.globals.isIconTermine.next(false)
    this.display_event = true
    this.ticketsAvailable.next(data.flag.length > 0)
    if (data.flag) {
      const flags = data.flag.split(',').map(flag => ( { provider: flag.split('=')[0], id: flag.split('=')[1] } ) as EventProvider )
      console.log(flags)
      if (flags.length === 1) {
        const link = this.api.generateTicketLink(flags[0].provider, flags[0].id, data.hash)
        this.ticketLink.next(this._sanitizer.bypassSecurityTrustUrl(link))
      }
    }
    if (data.zeitbis && data.zeitbis.toString().length == 2) data.zeitbis = data.zeitbis + ':00'
    this.selected_event_array.next(data)
    this.total_assistance = data.assists
    this.beschreibung.next(data.beschreibung || '')
    this.address.next(data.adressname || data.verort || data.missing_verort || '')
    this._cdr.detectChanges()
    this.image_max = data.totalImages > 5 ? 5 : data.totalImages
    this.rubrik = data.rubrik
    if (this.image_max > 5) this.image_max = 5
    if ((data.totalImages == 0) || !data.totalImages) this.trailer_pos.next(0)
    if (data.images.length > 0) {
      this.copyright.next(data.images[this.image.getValue()].copyright)
    }
    this.checkKino()
    if (this.kino) {
      this.loadTrailer()
    } else {
      this.no_trailer = true
    }
    this.previewImages()
    this.image.next(0)
    this._termine.loading.next(false)
    // Only on Kino
    if (data.rubrik === 'Kino') {
      // Subscribe to image index change and react to it
      this._subs.sink = this.image.subscribe(image => {
        this.previewImage.next(this._sanitizer.bypassSecurityTrustStyle(`url(${this.api_url}/data/photos/m/${this.selected_event_array.getValue().image_name}_${this.preview_array.getValue()[image]}_m.jpg)`))
      })
    } // Only in event with images field length > 0
    else if (!!this.selected_event_array.getValue().images.length) {
      // Subscribe to image index change and react to it
      this._subs.sink = this.image.subscribe(image => {
        try {
          this.previewImage.next(this._sanitizer.bypassSecurityTrustStyle(`url(${this.api_url}/data/termine_photos/m/${this.selected_event_array.getValue().images[this.preview_array.getValue()[image]].filename}_m.jpg)`))
        } catch (err) { }
      })
    }
    this.sendAssistance('list').then(_ => {
      if (this.user.logged_in == true) {
        this.sendAssistance('check').then(_ => this.pinIt('check'))
      }
    })
  }

  openShare(e: MouseEvent, event): void {
    e.stopPropagation()
    e.preventDefault()
    this._dialog.open(ShareDialog, {
      width: '350px',
      // @ts-ignore
      data: Object.assign(event, { disableOptions: true })
    })
  }

  ngOnDestroy() {
    this.globals.changeBody(false)
    this.globals.isIconTermine.next(true)
    // document.body.style.backgroundColor = ''
    this._subs.unsubscribe()
  }

  //checks if the event is a kino and enables the kino display
  checkKino() {
    if (this.selected_event_array.getValue()) {
      if (this.selected_event_array.getValue().rubrik == 'Kino') {
        this.kino = true
      }
    }
  }

  safari: boolean = false;
  //on resize calculate the layout and pass the values to the parent component
  @HostListener('window:resize') onResize() {
    this.mobile.next(this._tools.isDetailMobile())
  }

  //when pressing on close button
  closeId() {
    this._termine.comes_from_detail = true
    try {
      const classList = document.querySelector('mix-termine-detail .container').classList
      classList.remove('mobileAnimation')
    } catch (err) { }
    if (this.returnTo) {
      this.router.navigate(['/termine/main'], { replaceUrl: true }).then(_ => {
        this.globals.merkliste_page.next(true)
      })
    } else {
      this.router.navigate(['/termine/main'], { replaceUrl: true })
    }
  }

  beschreibung = new BehaviorSubject<string>('')
  address = new BehaviorSubject<string>('')

  no_images: boolean = false

  //when clicking on a websitelink checks the https and adds it if necessary
  redirect(event: Event) {
    if (event.hasOwnProperty('homepage_prefixed') && !event.homepage_prefixed) event.homepage_prefixed = 'http://' + event.homepage
    if ((!event.homepage.startsWith('https://')) && !event.homepage.startsWith('http://')) event.homepage = 'http://' + event.homepage;
    window.open(event.homepage_prefixed || event.homepage)
  }

  goSeeOtherOrtes() {
    // Open Dates Popup
    this._dialog.open(KinoDatesDialog, {
      data: { rows: this.selected_event_array.getValue().related_events, event: this.selected_event_array.getValue() },
      maxWidth: '95vw',
      panelClass: 'kino-dates-panel'
    })
  }

  emptySafeStyle = this._sanitizer.bypassSecurityTrustResourceUrl(``)

  baseUrl: string = 'https://www.youtube.com/embed/';
  trailer_url = new BehaviorSubject<SafeResourceUrl>(`null`)
  trailer_ready = new BehaviorSubject<boolean>(false)
  no_trailer: boolean = false;
  // if kino equals true call the youtube api, search for the event title + trailer, returns the first result and sanitizes the embed url + video id
  // for the iframe

  loadTrailer() {
    const event = this.selected_event_array.getValue()
    this._tools.log("[TermineDetail]", "Event", event);
    if (this.kino) {
      if (event.trailerurl && event.trailerurl != "not found") {
        if (event.trailerurl.toString().length >= 5) {
          this.trailer_url.next(this._sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${event.trailerurl}`))
        }
        this.trailer_ready.next(true)
        if (this.image_max > 0) this.trailer_pos.next(1)
        else this.trailer_pos.next(0)
      } else {
        this.no_trailer = true
        return
      }
    }
    else {
      this.no_trailer = true
    }
  }

  previewImage = new BehaviorSubject<SafeStyle>('')

  //mode 'set' (remove from assistance list if already on it, or add if not)
  //mode 'check' (see if you are assisting this event)
  //mode 'list' (see a list of assisting users)
  sendAssistance(mode): Promise<void> {
    return new Promise((resolve, reject) => {
      var user_data = new FormData;
      user_data.append("id", this.user.id)
      user_data.append("token", this.user.token)
      var json = JSON.stringify(this.old_json);
      user_data.append("old_json", json)
      if (this.user.social != null) {
        user_data.append('authToken', this.user.social['authToken'])
        user_data.append('idToken', this.user.social['idToken'])
        user_data.append("origin", this.user.social['provider'])
      } else {
        user_data.append("origin", 'mix')
      }
      user_data.append('eventid', this.selected_event_array.getValue().hash.toString())
      if ((mode == 'set') || (mode == 'add')) {
        user_data.append('mode', 'set')
        this.changed = true
        this.checked = false
      } else {
        user_data.append('mode', mode)
        this.checked = true;
      }
      if (mode == 'add') {
        user_data.append('add', 'true')
        mode = "set"
      } else {
        user_data.append('add', 'false')
      }
      this._subs.sink = this.api.sendAssistance(user_data).subscribe( data => {
        if (data['data'] != 'same') {
          this.old_json = data
          if (data['response'] != 'ok') {
            if (data['response'].startsWith('EX') === true) {
              if (mode == 'set') this.showAlert('Error', this.translate.instant("termine_details.error_assistance"));
              this.user.signOut();
            } else {
              if ((data['response'] == 'assistance saved') && (mode == 'set')) {
                //alert("assistance is saved!");
              }
              if ((data['response'] == 'deleted assistance') && (mode == 'set')) {
                //alert("assistance is deleted");
              }
              if ((data['response'] == '1') && (mode == 'check')) {
                this.assistance.next(true)
                this.attend_message = "I will NOT attend"
              } else {
                if (data['response'] == '0') {
                  this.assistance.next(false)
                  this.attend_message = "I will attend"
                }
              }
              if (mode == 'list') {
                if (data['total'] > 0) {
                  this.no_results = false;
                  this.total_assistance = data['total'];
                  this.user_list = data
                } else {
                  this.total_assistance = 0;
                  this.no_results = true;
                  this.user_list = []
                }
              }
              if (this.checked == false) {
                this.sendAssistance('check').then(_ => this.sendAssistance('list'))
              }
            }
          }
        }
      }, err => {}, () => resolve())
    })
  }


  getUserIcon(origin) {
    origin = origin.toLowerCase()
    if (origin == 'mix') return this._sanitizer.bypassSecurityTrustStyle(`url(/assets/social/MIXICON_Mix_Imag.svg)`);
    if (origin == 'facebook') return this._sanitizer.bypassSecurityTrustStyle(`url(/assets/social/MIXICON_Facebook_Imag.svg)`);
    if (origin == 'google') return this._sanitizer.bypassSecurityTrustStyle(`url(/assets/social/MIXICON_Google_Imag.svg)`);
  }

  //open url google maps with the correct sanitized string
  openMaps(event) {
    var maps_api = 'www.google.com/maps/search/?api=1&query='
    if ((event['missing_verort'] != null) && (event['missing_verort'] != '')) {
      var verort = event['missing_verort'].toLowerCase()
    } else {
      verort = this.address.getValue().toLowerCase()
    }
    var url = verort.replace("treffpunkt: ", "")
    if (event['strasse'] != null) var strasse = "+" + event['strasse'].toLowerCase()
    else strasse = ""
    if (event['plzort'] != null) var plzort = "+" + event['plzort'].toLowerCase()
    else plzort = ""
    url = url + strasse + plzort
    url = url.replace(" ", "+")
    var href = `https://${maps_api}${encodeURIComponent(url)}`;
    window.open(href);
  }

  //mode check (too see if user has a pin on it and mark it)
  //mode set (too change pin status on backend)
  //after set a check is sent to confirm the change and display it 
  pinned = new BehaviorSubject<boolean>(false)
  pinIt(mode) {
    const event = this.selected_event_array.getValue()
    var event_data = new FormData;
    event_data.append("eventid", event.eventid)
    event_data.append("rubrik", event.rubrik)
    event_data.append("titel", event.titel)
    event_data.append("originaltitel", event.originaltitel)
    event_data.append("datum", event.datum)
    event_data.append("uhrzeit", event.uhrzeit)
    event_data.append("sprachfassung", event.sprachfassung)
    if (event.totalImages == null) {
      event_data.append("totalImages", '0')
    } else {
      event_data.append("totalImages", event.totalImages.toString())
    }
    event_data.append("image_name", event.image_name)
    event_data.append("id", this.user.id)
    event_data.append("token", this.user.token)
    event_data.append("mode", mode)
    if (this.user.social != null) {
      event_data.append('authToken', this.user.social['authToken'])
      event_data.append('idToken', this.user.social['idToken'])
      event_data.append('idToken', this.user.social['idToken'])
      event_data.append("origin", this.user.social['provider'])
    } else {
      event_data.append("origin", 'mix')
    }

    if (!event.missing_verort) event_data.append("verort", event.adressname)
    else event_data.append("verort", event.missing_verort)

    this._subs.sink = this.api.sendTerminePin(event_data).subscribe( data => {
      if (data != null) {
        if (data['response'] == 'yes pin') this.pinned.next(true)
        if (data['response'] == 'no pin') this.pinned.next(false)
        if (data['response'] == 'created') {
          this.globals.termine_pin_deleted = -1;
          this.pinned.next(true)
          this.user.getTotalPins()
        }
        if (data['response'] == 'deleted') {
          this.pinned.next(false)
          this.user.getTotalPins()
        }
        this._ref.tick()
        if (data['response'].startsWith('EX') == true) {
          this.showAlert("MIX für ungut!", "Melde Dich bitte zuerst an, um Termine oder Kontakt- bzw. Marktplatz-Anzeigen auf Deine Merkliste zu setzen. Wenn Du <span class='alert-link'>hier klickst</span>, kannst Du Dich einloggen.");
          setTimeout(_ => {
            try {
              document.querySelector('.alert-link').addEventListener('click', () => {
                (document.querySelector('.head_icon.user_container') as HTMLElement).click();
                (document.querySelector('.alert') as HTMLElement).style.display = 'none';
              })
            } catch (err) { }
          })
        }
        if (mode == 'set') {
          this.pinIt('check')
        }
      }
    })
  }
  preview_array = new BehaviorSubject<number[]>([])
  loaded = false

  previewImages() {
    const event = this.selected_event_array.getValue()
    let preview_array = []
    if (event.totalImages > 0) {
      for (var i = 0; i < this.image_max + 1 && i <= 5; i++) {
        if (i === 1) {
          preview_array.push(-1);
          continue
        }
        if (i > 1) {
          preview_array.push(i - 1);
        } else {
          preview_array.push(0)
        }
      }
    } else {
      if (event.images.length > 0) {
        const images = event.images
        for (let i = 0; i < images.length; i++) {
          preview_array.push(i)
        }
      }
    }
    if (event.rubrik != 'Kino' && preview_array.indexOf(-1) > -1) preview_array.splice(preview_array.indexOf(-1), 1)
    this.preview_array.next(preview_array)
  }

  changePhoto(photo_n) {
    photo_n = photo_n != -1 ? photo_n : 0;
    this.image.next(photo_n)
    if (this.selected_event_array.getValue().images[photo_n]) this.copyright.next(this.selected_event_array.getValue().images[photo_n].copyright)
  }

  checkPreviewSelect(photo_n) {
    if (this.no_trailer == true) {
      if (this.image.getValue() == photo_n) return true
    } else {
      if (photo_n == -1) {
        if (this.image.getValue() === 1) return true;
      }
      if (photo_n >= 1) {
        if (this.image.getValue() === photo_n + 1) return true;
      } else {
        if (this.image.getValue() === photo_n) return true;
      }
    }
  }
  waiting: boolean = false;
  alert: boolean = false;
  pre_alert_message: string = "";
  message_alert: string = "";
  simple_alert: boolean = false;
  showAlert(pre_alert, message) {
    this.alert = true;
    this.pre_alert_message = pre_alert;
    this.message_alert = message;
    this.waiting = true;
  }
  removeAlert() {
    this.alert = false;
    this.simple_alert = false;
    this.pre_alert_message = "";
    this.message_alert = "";
    this.waiting = false;
    if (this.display_event == false) {
      this.router.navigate(['/termine/main'], { replaceUrl: true });
    }
  }

  sanitizeUrl() {
    var url_encoded = encodeURI(this.url);
    return this._sanitizer.bypassSecurityTrustUrl(`whatsapp://send?text=` + url_encoded);
  }

  getMailToUrl() {
    const url_encoded = encodeURI(this.url);
    const text = this.translate.instant('share').replace('$URL', url_encoded)
    return this._sanitizer.bypassSecurityTrustUrl(`mailto:?body=${text}`);
  }

  onFullscreen = false

  ticketLink = new BehaviorSubject<SafeUrl>(null)

  buyCart() {
    const event = this.selected_event_array.getValue()
    if (event.flag) {
      // There we can have multiple ticket providers, for example KINOHELD=45345,DK=27345
      const flags = event.flag.split(',').map(flag => ( { provider: flag.split('=')[0], id: flag.split('=')[1] } ) as EventProvider )
      if (flags.length > 1) {
        this._dialog.open(EventProvidersDialog, {
          data: {
            providers: flags,
            eventid: event.eventid,
            eventhash: event.hash,
            urls: event.tickets
          },
          minWidth: '350px',
          autoFocus: false
        })
      } else {
        // Open Ticket Url
        window.open(event.tickets[0].data.url);
        // Register click on ticket provider
        this._subs.sink = this.api.getTicketUrl(`${event.tickets[0].provider}=${event.tickets[0].id}`, event.eventid).subscribe()
      }
    } else {
      this._tools.alert('MIX für ungut!', this.translate.instant('termine.no_ticket_available'), '', 'OK')
    }
  }

  openFullscreen() {
    this.onFullscreen = true
    let dialog = this._dialog.open(FullscreenDialog, {
      panelClass: 'fullscreen-images',
      data: Object.assign(this.selected_event_array.getValue(), { currentIndex: this.image.getValue() })
    })
    this._subs.sink = dialog.afterClosed().subscribe(_ => this.onFullscreen = false )
  }

  next() {
    const event = this.selected_event_array.getValue()
    if (this.preview_array.getValue()[this.image.getValue() + 1]) {
      this.image.next(this.image.getValue() + 1)
    } else {
      this.image.next(0)
    }
    if (event.images.length > 0) {
      this.copyright.next(event.images[this.image.getValue()].copyright)
    }
  }

  previous() {
    const event = this.selected_event_array.getValue()
    if (this.image.getValue() - 1 >= 0) {
      this.image.next(this.image.getValue() - 1)
    } else {
      this.image.next(this.image_max)
    }
    if (event.images.length > 0) {
      this.copyright.next(event.images[this.image.getValue()].copyright)
    }
  }

  copyright = new BehaviorSubject<string>('')

  getMultidimensionImage(imageIndex: number) {
    const event = this.selected_event_array.getValue()
    const preview_array = this.preview_array.getValue()
    // Use the updateOn field for caching version
    let timestamp = '1'
    if (event.updatedOn) timestamp = event.updatedOn.replace(/[^0-9]/g, '')
    try {
      var path = event.rubrik === 'Kino' || event.images.length === 0 ?
        `${event.image_name}_${preview_array[imageIndex]}` : // Kino
        `${event.images[preview_array[imageIndex]].filename}` // Not Kino
    } catch (err) { }
    let prefix = 'photos'
    if (this.selected_event_array.getValue().rubrik !== 'Kino') prefix = `termine_${prefix}`
    path = encodeURIComponent(path)
    return {
      small: this.api_url + `data/${prefix}/s/${path}_s.jpg?version=${timestamp}`,
      medium: this.api_url + `data/${prefix}/m/${path}_m.jpg?version=${timestamp}`,
      large: this.api_url + `data/${prefix}/${path}_org.jpg?version=${timestamp}`
    }
  }

  srcset = new BehaviorSubject<string>('')
  bigImage = new BehaviorSubject<string>('')
  mediumSrc = new BehaviorSubject<string>('')
  largeSrc = new BehaviorSubject<string>('')
  smallSrc = new BehaviorSubject<string>('')
  src = new BehaviorSubject<string>('')
}

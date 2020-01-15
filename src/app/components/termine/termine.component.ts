import { Component, OnInit, HostListener, ChangeDetectorRef, AfterContentChecked, ChangeDetectionStrategy, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { UserService } from '@services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { Event, EventsReponse, EventType } from '@other/interfaces';
import { debounce } from '../../decorators/debounce';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { debounceTime, map, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ShareDialog } from 'app/dialogs/share/share.dialog';
import { MatDialog } from '@angular/material/dialog';
import { BannerService } from '@services/banner.service';
import { timer } from 'rxjs/internal/observable/timer';
import { ToolsService, safeGetStorageItem, safeSetStorageItem, safeRemoveStorageItem, SubSink } from '@services/tools.service';
import { InfoService } from '@services/info.service';
import { TermineDetailFlagDialog } from 'app/dialogs/termine-detail-flag/termine-detail-flag.dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { SatDatepicker } from 'saturn-datepicker';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import * as MobileDetect from 'mobile-detect';

declare const dayjs, $: any


@Component({
  selector: 'app-termine',
  templateUrl: './termine.component.html',
  styleUrls: ['./termine.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  /* host: {
      '(document:click)': 'handleClick($event)',
  }, */
  animations: [
    trigger(
      'fade', [
        transition(':enter', [
          style({ opacity: 0.0 }),
          animate('500ms', style({ opacity: 1 }))
        ])
      ]
    ),
    trigger(
      'detailedFlagAnimation', [
        transition(':enter', [
          style({ maxHeight: 0 }),
          animate('250ms ease-in-out', style({ maxHeight: '200px' }))
        ]),
        transition(':leave', [
          style({ maxHeight: '200px' }),
          animate('250ms ease-in-out', style({ maxHeight: 0 }))
        ])
      ]
    ),
    trigger(
      'flagAnimation', [
        transition(':enter', [
          style({ right: '-30px' }),
          animate('150ms 200ms ease-in-out', style({ right: 0 }))
        ]),
        transition(':leave', [
          style({ right: 0 }),
          animate('150ms ease-in-out', style({ right: '-30px' }))
        ])
      ]
    )
  ]
})
export class TermineComponent implements OnInit, AfterContentChecked/* , DoCheck */, OnDestroy {

  // Callback every time a change detection runs
  // https://stackoverflow.com/questions/43149097/how-can-you-identify-whats-triggering-round-of-change-detection-detection-in-an
  /* ngDoCheck() {
    // @ts-ignore
    if (Zone.currentTask) this._tools.log("[TermineComponent]", "Change Detection", Zone.currentTask.source)
  } */
  
  _subs = new SubSink()

  ngAfterContentChecked() {
    this._cdr.detectChanges()
  }

  rubrik_array = new BehaviorSubject<string[]>([])

  addRubrik(rubrik, e: MouseEvent) {
    // Prevent propagation of click
    e && e.stopPropagation()
    let rubriks = this.rubrik_array.getValue()
    // Alle Kategorien
    if (rubrik == '') {
      rubriks = []
      this.rubrik_array.next(rubriks)
      return
    }
    // Select all
    if (rubrik == 'all') {
      rubriks = this._info.serverInfo.rubriks.map(r => r.rubrik).filter(r => r != 'Ausstellungen')
      this.rubrik_array.next(rubriks)
      return
    }
    // Add or remove the rubrik to the array sended to get_events.php
    if (rubriks.includes(rubrik)) {
      rubriks = rubriks.filter(r => r != rubrik)
    } else {
      rubriks.push(rubrik)
    }
    this.rubrik_array.next(rubriks)
  }

  ngOnDestroy() {
    this._subs.unsubscribe()
    this.globals.isIconTermine.next(false)
  }

  search = new FormControl('')
  changing = new BehaviorSubject<boolean>(false) //when changing filters
  events = new BehaviorSubject<any[]>([])
  ready = new BehaviorSubject<boolean>(false)
  events_rubrik: any[] = []
  base_rubrik_obtained = new BehaviorSubject<boolean>(false)
  events_loaded = new BehaviorSubject<boolean>(false)
  last_search: string = ""
  mobile = new BehaviorSubject<boolean>(false)
  offset: any[] = []
  mobile_offset = new BehaviorSubject<number>(9)
  mobile_offset_visible = new BehaviorSubject<number>(9)
  events_filtered: any[] = []
  filter = new BehaviorSubject<string>('rubrik') // Type of view: Rubrik, Titel, Uhrzeit & Addressname
  total = new BehaviorSubject<number>(-1)
  was_wann_wo = new BehaviorSubject<boolean>(false)
  days_no = new BehaviorSubject<number>(7)
  rubrik_filter: string = ""
  rubrik = new BehaviorSubject<string>('Alle Kategorien') // Observable containing the rubrik category text selected
  filtered_offset = new BehaviorSubject<number>(20)
  list_page_found = new BehaviorSubject<boolean>(false)
  banners: any[] = []
  selected_rubrik = new BehaviorSubject<string>('')
  orte_filter: any[] = []
  orte_filter_show: any[] = []
  banner_difference = new BehaviorSubject<number>(7)
  selected_event = new BehaviorSubject<string>('main')
  selected_event_array: any[] = []
  desktop_fullscreen = new BehaviorSubject<boolean>(false)
  event_show = new BehaviorSubject<boolean>(false)
  first_search: boolean = true
  region: string = ""
  user_search: boolean = false
  display_was = new BehaviorSubject<boolean>(false)
  display_wann = new BehaviorSubject<boolean>(false)
  comes_from_detail: boolean = false
  previous_scroll: number = 0

  easterEgg = new BehaviorSubject<boolean>(false)

  // if backend delivers events with "GROUP BY title, verort" then this is true 
  events_are_grouped = new BehaviorSubject<boolean>(false)

  minDate: Date = new Date()

  constructor(
    public translate: TranslateService,
    public api: ApiService,
    public globals: GlobalsService,
    public user: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private _dialog: MatDialog,
    public _cdr: ChangeDetectorRef,
    private _banner: BannerService,
    private _date: DatePipe,
    public _info: InfoService,
    private _zone: NgZone,
    private _breakpointObserver: BreakpointObserver
  ) {
    this._subs.sink = this._breakpointObserver.observe([
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]).subscribe(result => {
      if (result.matches) {
        setTimeout(_ => this.onResize())
      }
    });
    (window as any).termine = this
    const termine_filter = safeGetStorageItem('termine_filter')
    if (!!termine_filter) {
      this.filter.next(termine_filter)
    }

    // ResetTermine 
    this._subs.sink = this.globals.resetTermineView.subscribe(
      _ => { 
        // empty last_search so that onKey() fires the backend search
        this.last_search = "";
        this.search.setValue('');
        // Empty rubrik
        this.rubrik_search_list = [];
        this.rubrik_filter = "";
        this.rubrik_arr_form = [];
        // Set Days to today
        this.formday.next(0);
        this.days_no.next(0);
        this.onKey('manual');
      }
    )
    this._subs.sink = combineLatest(this.route.paramMap, this.route.queryParamMap).subscribe(([params, queryParams]: [ParamMap, ParamMap]) => {
      if (queryParams.get('screen') === 'ansicht') {
        this.ansicht.next(true)
        // if (this.mobile.getValue()) document.body.style.backgroundColor = 'black'
        setTimeout(_ => this.router.navigate(['/termine', 'main']))
      }
      if (queryParams.get('screen') === 'welcome') {
        safeRemoveStorageItem('search')
        this.search.setValue('')
        this.rubrik_array.next([])
        // this.changeNewRubrik('')
        this.event_show.next(false)
        this.events_loaded.next(false)
        this.rubrik_arr_form = []
        this.rubrik_arr_form.push('')
        this.globals.first_search = false
        this.event_show.next(false)
        this.events_loaded.next(false)
        this.globals.first_search = false
        this.formday.next(0)
        this.formhour = -1
        // this.changeNewWann(0)
        this.changeFilter('rubrik')
        setTimeout(_ => this.router.navigate(['/termine', 'main']))
      } else {
        const searchStorage = safeGetStorageItem('search')
        if (!!searchStorage) this.search.setValue(searchStorage, { emitEvent: false })
      }
      this.selected_event.next(params.get('id'))
      if (params.get('id') !== 'main') {
        // Save current scroll for when closing event detail
        try {
          const doc = document.documentElement
          this.previous_scroll = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
        } catch (err) {}
      } else if (params.get('id') === 'main' && this.comes_from_detail) {
        // If comes from event detail, return to previous scroll position
        setTimeout(_ => {
          window.scrollTo({ top: this.previous_scroll })
          this.comes_from_detail = false
          this._cdr.detectChanges()
        })
      }
      // Subscribe to the changes on the search FormControl and react on the search term,
      // with a debounce time of 500 ms to improve speed
      this._subs.sink = this.search.valueChanges.pipe(
        debounceTime(500),
        map(search => search.toString().trim()),
        tap(value => safeSetStorageItem('search', value))
      ).subscribe(search => this.onKey(search))
      setTimeout(_ => this.onResize())
    })
  }

  triggerDatePicker() {
    this.dateSelector.open()
    setTimeout(() => {
      document.querySelector('.mat-datepicker-popup').classList.add('mobile')
    })
  }

  customDate = new FormControl()

  @ViewChild('dateSelector', { static: false }) dateSelector: SatDatepicker<any>

  stopPropagation(e?: MouseEvent) {
    if (e) e.stopPropagation()
  }

  disableDisplayWas(e?: MouseEvent) {
    if (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
    }
    this.display_was.next(false)
    this.changeNewRubrik()
  }

  disableDisplayWann(e?: MouseEvent) {
    if (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
    }
    this.display_wann.next(false)
  }

  triggerFirstEvent(e: MouseEvent) {
    if (this.filter.getValue() === 'titel') {
      const section = (e.target as HTMLElement).closest('.rubrik_section');
      (section.querySelector('.event_display:first-child') as HTMLElement).click();
    }
  }

  @HostListener('window:scroll') scrollHandler() {
    const windowHeight = window.innerHeight
    const windowScrollY = window.scrollY
    const documentHeight = document.body.offsetHeight
    if ((windowHeight + windowScrollY) >= (documentHeight - 1300) && this.mobile.getValue()) {
      this.checkListOffset('next', this.total.getValue())
    }
  }

  ngOnInit() {
    var wait = 0
    this.loading.next(true)
    this.globals.isIconTermine.next(true)
    if (safeGetStorageItem("dark")) this.globals.dark = true
    //only wait for load info if user has a session localstorage item and its first search
    if (this.globals.first_search == true) wait = 2000
    if (!safeGetStorageItem("session_token")) wait = 0
    if (this.user.checked_settings == true) wait = 0
    if (this.formhour != -1) this.formday.next(0)
    if (this.globals.localStorage) {
      this.getLocalstorageFilter()
    } else {
      this.globals.first_search = true
    }
    this.globals.picture_fullscreen = false
    this._subs.sink = timer(wait).subscribe(_ => {
      // this.getWasWannWo() // This function is empty
      if (this.selected_event.getValue() != null) {
        this.sendSearch()
      }
    })
    this.globals.mobile_keyboard = false
    this.globals.picture_fullscreen = false
    setTimeout(_ => this.onResize())
  }

  closedDatePicker() {
    const value = this.customDate.value
    const begin = this._date.transform(value.begin, 'dd.MM.yyyy')
    const end = this._date.transform(value.end, 'dd.MM.yyyy')
    const date = `${begin}-${end}`
    this.changeNewWann(date)
    this.display_wann.next(false)
  }

  lastWidth = window.innerWidth

  @HostListener('window:orientationchange')
  @debounce(100)
  orientationAuto() {
    setTimeout(_ => this.onResize())
  }

  @HostListener('window:resize')
  @debounce(200)
  resizeAuto() {
    // Prevent resize if width is the same as before
    if (window.innerWidth === this.lastWidth) return
    this.onResize()
  }

  openDetailedText() {
    this._dialog.open(TermineDetailFlagDialog, { autoFocus: false })
  }

  amount_block_events: number;

  onResize() {
    // Continue on resizing process
    // Show Search Icon coming back from Detail
    this.globals.showSearchIcon.next(window.innerWidth <= 600)
    this.lastWidth = window.innerWidth
    if (this.selected_event.getValue() == 'main') {
      const isMobile = window.hasOwnProperty('orientation') ?
        (window.orientation === 0 ? window.innerWidth < 600 : false) :
        window.innerWidth < 600
      if (this.mobile.getValue() !== isMobile) this._banner.resetOrder() // Reset banners order
      const mobileDetector = new MobileDetect(window.navigator.userAgent)
      this.mobile.next(isMobile || !!mobileDetector.phone())
      setTimeout(() =>  $('<style></style>').appendTo($(document.body)).remove());
      this.desktop_fullscreen.next(!isMobile)
      if (window.innerWidth > 1400) {
        this.amount_block_events = 3
      }
      if (window.innerWidth <= 1400) {
        this.amount_block_events = 2
      }
      if (window.innerWidth <= 1000) {
        this.amount_block_events = 1
      }
    }
  }

  processBannerDifference() {
    if (this.filter.getValue() === EventType.RUBRIK) {
      if (this.mobile.getValue()) {
        this.banner_difference.next(7)
      } else if (this.amount_block_events == 3) {
        this.banner_difference.next(8)
      } else {
        this.banner_difference.next(9)
      }
    } else {
      this.banner_difference.next(7)
    }
  }

  // Tracking for *ngFors
  getId(event) {
    return event.eventid
  }

  hideRubrikSpinner(rubrik) {
    try {
      let htmlElement = (document.querySelector('.rubrik_spinner_' + rubrik.replace(/\s+/g, '_')) as HTMLElement)
      htmlElement.style.display = 'none'
    } catch (err) { }
  }

  changeSelectedRubrik(rubrik) {
    try {
      (document.querySelector('.rubrik_spinner_' + rubrik.replace(/\s+/g, '_')) as HTMLElement).style.display = 'block';
    } catch (err) { }
    setTimeout(_ => {
      this.selected_rubrik.next(rubrik)
    })
  }

  // events_has_multiple_ortes: Used to manage to termine details wether ot not the event has some other ortes
  events_has_multiple_ortes = false

  // filter_titel_from_multiple: Used to filter title view when coming from rubrik view,...
  // ...termine detail and the user wants to see some other hours and ortes
  filter_titel_from_multiple = new BehaviorSubject<string>('')

  /**
   * goDetail takes event as parameter and looks at the number of events in event.events_count
   * if it is greater than 1, sets events_has_multiple_ortes to true, otherwhise false
   * This variable is used in detail to determin if an additional link must be displayed or not.
   * goDetail then navigates to the event using the router.
   * 
   * changelog:
   * 2019-04-12 ALB created, RRO update documentation ... and inserted goDetail() to html of mobile
   * 
   * @param event 
   */
  goDetail(event: Event) {
    // check if this event has multiple_ortes ... and set it to true or false
    this.events_has_multiple_ortes = ( event.events_count > 1 ) ? true : false
    // this.loadingDetail.next(true)
    // Preload event before navigating
    // if (this.mobile.getValue()) document.body.style.backgroundColor = 'black'
    this._zone.run(() => this.router.navigate(['/termine', `${event.eventid}-${event.sessionid}`]))
  }

  loadingDetail = new BehaviorSubject<boolean>(false)

  event_data = new BehaviorSubject<Event>(null)

  disable_click: boolean = false

  //add banners to the rubrik array
  initial_offset: number = 3
  addBanners() {
    var offset = this.initial_offset
    var offset_add = 4
    var exit = false
    var i = 1
    var banner_group = []
    banner_group['banner_data'] = this.banners
    banner_group['rubrik'] = 'banner'
    // shuffle banner_group['rubrik'] to make them random
    while (!exit) {
      i++
      if (i > this.banners.length - 1) i = 1
      if (offset < this.events_rubrik.length) {
        this.events_rubrik.splice(offset, 0, banner_group)
      } else {
        exit = true
      }
      offset = offset + offset_add
    }
  }


  random_banners = []

  //open url google maps with the correct sanitized string
  openMaps(event) {
    var maps_api = 'www.google.com/maps/search/?api=1&query='
    if (event.hasOwnProperty('missing_verort')) {
      var verort = event.rubrik
    } else {
      var verort = event.rubrik
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

  new_rubrik: any = []
  aux_new_rubrik = []
  aux_event_rubrik = []

  /**
   * function getFiltered()
   *
   * returns the group by title to organize events 
   * (example: rubrik returns all the rubrik titles plus a count(*))
   *
   */
  getFiltered(filter, days) {
    this.loading.next(true)
    let form = new FormData()
    form.append('filter', filter)
    form.append('days_no', days.toString())

    form.append('rubrik_list', this.rubrik_filter)

    if (this.region_array.length > 0) {
      this.region = this.region_array.join('#,#')
    } else {
      this.region = ""
    }

    form.append('region', this.region)
    if ((this.globals.first_search == true) && (this.user_search == false)) {
      form.append('default', 'true')
    } else {
      form.append('default', 'false')
    }
    if (this.checkFromBackend()) {
      form.append('searchstring', this.search.value)
    }
    if (this.searchFromBackend.getValue()) {
      form.append('searchstring', this.search.value)
    }
    this.events_loaded.next(false)
    this.event_show.next(false)

    //
    // Send searchstring always, if there is something inside
    //
    if (this.search.value.length >= 3 || this.search.value.toUpperCase().includes('3D')) {
      form.append('searchstring', this.search.value)
    }

    //
    // Push all retrieved data to this.events_rubrik
    //
    this.new_rubrik = this.getEventRubriks(this.events.getValue())

    //
    // Decide wether events have been grouped or not
    // * check if not grouped by backend  and data.length from backend is same after doing the reduce
    if ( !this.events_are_grouped
      && 0 > this.new_rubrik.length ) {
        this.events_are_grouped.next(true);
    }
    
    this.aux_events = this.events.getValue()

    // this.aux_event_rubrik = Object.keys(this.new_rubrik)
    this.events_rubrik = []
    for (let key in this.new_rubrik) {
      const { datum, uhrzeit, datum_humanized } = this.new_rubrik[key][0]
      let element: any = {
        rubrik: key,
        datum: datum,
        uhrzeit: uhrzeit,
        datum_humanized: datum_humanized
      }
      this.events_rubrik.push(element)
    }
    this.aux_event_rubrik = this.events_rubrik

    // this.events_rubrik.forEach(element => {
    //   this.aux_event_rubrik.push(element)
    // })

    this.waiting = false;

    if (this.events_rubrik.length > 0) {
      if (this.filter.getValue() === 'rubrik') {
        this.total.next(this.events.getValue().length)
      } else {
        this.total.next(this.events_rubrik.length)
      }
      if (this.new_rubrik.length == 1) {
        this.selected_rubrik.next(this.new_rubrik[Object.keys(this.new_rubrik)[0]].rubrik)
      } else {
        this.selected_rubrik.next('')
      }
      this.base_rubrik_obtained.next(true)
      this.globals.first_search = false
    }

    // Show Kein Ergebnis if length of rubriks is 0
    this.evenMore.next(this.events_rubrik.length === 0 && this.search.value.length > 0)
    this.globals.no_results.next(
      this.events_rubrik.length === 0 &&
      !this.searchFromBackend.getValue() &&
      !this.easterEgg.getValue()
      // this.total.getValue() !== -1
    )
    // if (!this.checkFromBackend()) this.onKey('manual')
    this.selected_rubrik.next(this.events_rubrik.length === 1 ? this.events_rubrik[0].rubrik : 'main')
    // Finally
    // console.log("------------------------------------------------- getFiltered ")
    // this._tools.log("[TermineComponent]", "Totals after  getting events: ", this.total.getValue())
    // this._tools.log("[TermineComponent]", "aux_event_rubrik + events_rubrik: ", this.aux_event_rubrik.length, this.events_rubrik.length)
    // this._tools.log("[TermineComponent]", "Category: ", this.rubrik_arr_form)
    // if ( this.events_are_grouped ) this._tools.log("[TermineComponent]", "Events have been grouped in backend ")
    // This debug is heavy for the client, only use it in special cases
    // this._tools.log("[TermineComponent]", "new_rubrik:", this.new_rubrik)
    // console.log("------------------------------------------------- ")

    // Save the search string to last_search to indicate that data has been retrieved from backend
    // ... so if something changes in front, we will search again
    this.last_search = this.formday.getValue() + "@@" + this.rubrik.getValue() + "@@" + this.search.value

    // switch off spinner
    this.events_loaded.next(true)

    this.ready.next(true)
    this.event_show.next(true)
    this.loading.next(false)
  }

  evenMore = new BehaviorSubject<boolean>(false)

  //initialize the offset of every rubrik on 2;
  setOffset(rubrik) {
    if (this.offset[rubrik] == null) this.offset[rubrik] = 1
    return true
  }

  // debugUhrzeitPage()
  debugUhrzeitPage(new_rubrik, rubrik, event, search_value, rubrik_index, mobile) {
    // console.log("AMV - debugFunc:", this.mobile.getValue())
    // console.log(rubrik,event, search_value, rubrik_index, mobile );
    // console.log(rubrik_index, new_rubrik);
    return true;
  }

  //mobile list offset (next and back)
  checkListOffset(direction, maximum) {
    if (!this.desktop_fullscreen.getValue()) {
      //normal mobile mode
      const mobile_offset = this.mobile_offset.getValue()
      if ((direction == 'back') && (mobile_offset - 10 >= 0)) {
        this.mobile_offset.next(mobile_offset - 10)
      }
      if ((direction == 'next') && (mobile_offset + 1 <= maximum)) {
        this.mobile_offset.next(mobile_offset + 10)
      }
      this._cdr.detectChanges()
    } else {
      //desktop all view
      const mobile_offset = this.mobile_offset.getValue()
      if ((direction == 'back') && (mobile_offset - 10 >= 0)) this.mobile_offset.next(mobile_offset - 10)
      if ((direction == 'next') && (mobile_offset + 1 <= maximum)) this.mobile_offset.next(mobile_offset + 24)
    }
    setTimeout(_ => {
      this.mobile_offset_visible.next(document.querySelectorAll('.event_display').length)
    })
  }

  waiting = false
  changeFilter(new_filter: string) {
    this._banner.resetOrder() // Reset banners order
    this.next_enabled = true
    this.original_ansicht = this.filter.getValue()
    this.filter.next(new_filter)
    this.processBannerDifference()
    safeSetStorageItem('termine_filter', new_filter)
    window.scrollTo({ top: 0 })
    this.desktop_fullscreen.next(false)
    this.filter_titel_from_multiple.next('')
    this.waiting = true
    this.filtered_offset.next(20)
    this.addBanners()
    this.pushHistory()
    this.loading.next(true)
    this.ansicht.next(false)
    setTimeout(_ => {
      this.getFiltered(this.filter.getValue(), this.days_no.getValue())
    })
    if (new_filter == 'rubrik') {
      this.changing.next(true)
      setTimeout(() => {
        this.changing.next(false)
      }, 100)
    }
  }

  // Open Share Dialog
  openShare(e: MouseEvent, event): void {
    e.stopPropagation()
    this._zone.run(() => {
      this._dialog.open(ShareDialog, {
        width: '350px',
        data: event
      })
    })
  }

  ansicht = new BehaviorSubject<boolean>(false)

  toggleAnsicht() {
    if (this.ansicht.getValue()) {
      this.ansicht.next(false)
    } else {
      this.ansicht.next(true)
      this.pushHistory();
    }
    this.globals.menu_inside_body_open = this.globals.menu_inside_body_open ? false : true;
  }

  //when clicking on checkbox rubrik, see if rubrik exists on array, if it already exists remove it, else add it
  rubrik_arr: any[] = []
  rubrik_arr_form: any[] = [""]

  //check if clicked inside or outside ansicht, exit ansicht if outside // when on was wann wo check if you click outside the wo list and if true hide the list
  absorb_click = true

  formday = new BehaviorSubject<number>(0)
  day_value: string = ""


  formhour: number = 0

  searchFromBackend = new BehaviorSubject<boolean>(false)

  extendedSearch = new BehaviorSubject<boolean>(false)
  extendedSearchClass = new BehaviorSubject<string>('')

  //send a request to backend with the was wann wo filters
  sendSearch() {
    this.loading.next(true)
    this.selected_rubrik.next('')
    this.next_enabled = true;
    let form = new FormData();
    var rubrik_list = this.rubrik_arr_form.join(";");
    if (this.globals.localStorage == true) {
      safeSetStorageItem("rubrik_list", rubrik_list)
    }
    if (this.rubrik_arr_form.length == 1) {
      this.selected_rubrik.next(this.rubrik_arr_form[0])
    } else {
      this.selected_rubrik.next('')
    }
    this.rubrik_filter = rubrik_list
    this.rubrik.next(rubrik_list || 'Alle Kategorien') // Update rubrik text on was wann wo bar
    if (this.formday.getValue() == 50 && this.rubrik.getValue() == 'Alle Kategorien') {
      // this.search_from_backend_msg.next(this.search.value.length < 3);
      (document.querySelector('#search') as HTMLInputElement).focus()
    }
    form.append('rubrik_list', rubrik_list)
    form.append('days_no', this.formday.getValue().toString())
    safeSetStorageItem("formday", this.formday.getValue().toString())
    if ((this.globals.first_search == true) && (this.user_search == false)) {
      form.append('default', 'true')
    }
    else {
      form.append('default', 'false')
    }

    // Always have a look at searchstring if the string is bigger then 3 characters
    if (this.search.value.length >= 3 || this.search.value.toUpperCase().includes('3D')) form.append('searchstring', this.search.value)

    this.days_no.next(this.formday.getValue())
    this.new_rubrik = []
    this._subs.sink = this.api.getEventSearch(form).subscribe( (data: EventsReponse) => {
      this.extendedSearch.next(data.extended_search && data.rows.length > 0)
      this.extendedSearchClass.next(data.extended_search_downgraded_filter || '')
      if (data.success) {
        this.searchFromBackend.next(false)
        this.events.next(data.rows)
        this.aux_events = data.rows
        this.aux_new_rubrik = this.new_rubrik
        this.first_search = false
        this.absorb_click = true
        this.events_are_grouped.next(data.grouped)
        // If there is data.rubriks in the response, then update the variable with the rubriks in memory
        if (data.rubriks) {
          this._info.serverInfo.rubriks  = data.rubriks;
        }
      } else {
        // If search is required on the backend, show a message to the user
        if (data.error_code === 'search_required') {
          this.events_are_grouped.next(false)
          this.searchFromBackend.next(true)
        }
      }
    }, err => { },
    () => {
      this.event_show.next(true)
      this.events_loaded.next(true)
      this.filter_titel_from_multiple.next('')
      this.getFiltered(this.filter.getValue(), this.days_no.getValue())
    })
    this.filtered_offset.next(20)
    this.mobile_offset.next(10)
    Object.keys(this.offset).forEach(element => {
      if (element != 'object') this.offset[element] = 1
    })
  }

  /**
  * @description Switch on the actual view filter and classify events depending on this view. 
  * Then reduce the source events classifying them with unique index names
  * @param events: Event[]
  */
  getEventRubriks(events: Event[]): any {
    switch (this.filter.getValue()) {
      case "rubrik":
        return events.reduce((r, a) => {
          r[a.rubrik] = r[a.rubrik] || []
          r[a.rubrik].push(a)
          return r
        }, {})
      case "titel":
        return events.reduce((r, a) => {
          r[a.titel] = r[a.titel] || []
          r[a.titel].push(a)
          return r
        }, {})
      case "uhrzeit":
        return events.reduce((r, a) => {
          r[`${a.uhrzeit} ${a.datum}`] = r[`${a.uhrzeit} ${a.datum}`] || []
          r[`${a.uhrzeit} ${a.datum}`].push(a)
          return r
        }, {})
      case "adressname":
        return events.reduce((r, a) => {
          r[a.adressname] = r[a.adressname] || []
          r[a.adressname].push(a)
          return r
        }, {})
    }
  }

  // Check if the next search has to be done from a backend request
  checkFromBackend(): boolean {
    // console.log("AMVARA - checkFromBackend [Days:", 
    //               this.formday.getValue(),
    //               " Rubrik:", this.rubrik.getValue(), 
    //               " Search:", this.search.value )

    // Patch from ticket #1311 -> [SEARCH] do not filter in front
    // Only search on Backend if previous search is different from next search

    // The actual search
    var actual_search = this.formday.getValue() + "@@" + this.rubrik.getValue() + "@@" + this.search.value

    if (this.last_search === "" || this.last_search !== actual_search) {
      this.last_search = actual_search
      return true
    }
    return false
  }

  //reset everything to default, redo the default query
  resetSearch() {
    this.globals.first_search = true;
    this.search_mode = false;
    this.day_value = ""
    this.formday.next(-1)
    this.selected_rubrik.next('')
    this.formhour = -1;
    this.region = "";
    this.next_enabled = true;
    let form = new FormData();
    this.rubrik_arr_form = [];
    var rubrik_list = ""
    this.mobile_offset.next(10)
    this.orte_filter = [];
    this.orte_filter_show = [];
    this.orte_filter_bar = [];
    safeRemoveStorageItem("rubrik_list")
    safeRemoveStorageItem("formhour")
    safeRemoveStorageItem("formday")
    safeRemoveStorageItem("location")
    safeRemoveStorageItem("location_selected")
    this.resetSearchbar();
    Object.keys(this.offset).forEach(element => {
      if (element != 'object') this.offset[element] = 1;
    })
    this.rubrik_filter = rubrik_list;
    form.append('rubrik_list', "")
    form.append('days_no', "")
    this.days_no.next(7)

    this.events_loaded.next(false)
    setTimeout(() => {
      this.sendSearch();
      this.filtered_offset.next(20)
      // this.filter.next(EventType.RUBRIK)
      //this.getFiltered(this.filter, this.days_no);
      this.getOrteFilter()
    }, 200);

  }

  //check if the event list is not empty
  checkList() {
    if (!this.list_page_found.getValue()) {
      this.list_page_found.next(true)
    }
  }

  //if page is empty return to previus page and disable the 'next button'
  next_enabled: boolean = true

  //when changing von bis on was wann wo formulary
  startdate: string = "";
  enddate: string = "";

  wo_search: string = ""

  focus_orte: boolean = false;
  orte_array: any[]
  second_click: boolean = true;

  region_array: any[] = []
  loadRegion(event) {
    this.region_array.push(event['region']);
    this.orte_filter_show.push(event);
  }

  //when clicking on a rubrik while image view is active (all events fold out) move the scroll to its position
  scrollKat() {
    setTimeout(() => {
      var reference = document.getElementsByClassName("reference")
      if (reference.length != 0) {
        reference[0].scrollIntoView({ block: "start", behavior: "smooth" })
      }
    }, 200)
  }

  search_value: string = ""
  search_display: boolean = false
  rubrik_search_list: any[] = []
  search_list: any[] = []
  search_array: any[] = []
  kategorie: string = ""
  aux_events: Event[] = []
  searched: boolean = false
  timeout

  search_from_backend_msg = new BehaviorSubject<boolean>(false)
  loading = new BehaviorSubject<boolean>(false)

  //search bar
  onKey(event: string) {
    if (event !== 'manual' && typeof event === 'string') {
      const easter = ( event.toLowerCase() === 'mix geht mehr' || event.toLowerCase() === 'mix geht mehr!' )
      if (easter) {
        this.easterEgg.next(true);
      } else {
        this._subs.sink = timer(100).subscribe(_ => this.easterEgg.next(false))
      }
      if (easter) setTimeout(_=> {
        (document.querySelector('input.new_search') as HTMLInputElement).blur()
      })
    }
    //
    // If category is "all" and time is "all" - then we do not search, data is coming searched from backend
    //
    /* var execute_backend=false;
    if (this.formday.getValue() === 50 && this.rubrik.getValue() === 'Alle Kategorien' && event.length >= 3) execute_backend = true
    if (this.formday.getValue() === 50 && this.rubrik.getValue() === 'Ausstellungen' && event.length >= 3) execute_backend = true */
    if (this.checkFromBackend()) {
      this.search_from_backend_msg.next(false)
      this.loading.next(true)
      this.sendSearch();
      // try to focus the searchbar
      try {
        // (document.querySelector('#search') as HTMLInputElement).focus();
      } catch(e) {
        // do nothing
      }
      return
    } else if (this.formday.getValue() === 50 && this.rubrik.getValue() === 'Alle Kategorien' && event.length < 3) {
      this.search_from_backend_msg.next(true)
      this.globals.no_results.next(false)
      return
    } else {
      // this._tools.log('[TermineComponent]', 'Search', 'from JS')
      // if (event.length >= 1 && event.length <= 2) return
      // if (event != 'manual') {
      //   this.search_value = this.search.value
      //   if (this.globals.localStorage == true) safeSetStorageItem("search", this.search_value)
      // }
      // this.searched = true
      // this.search_display = true
      // this.kategorie = ""
      // var aux
      // this.search_list = []
      // this.rubrik_search_list = []
      // this.search_array = this.search.value ? this.search.value.split(" ") : []
      // // 2019-04-09 no more search in front ... it has been decided that events reach the front filtered
      // this.search_list = this.aux_new_rubrik;
      // this.rubrik_search_list.sort()
      // this.events_rubrik = []

      // // Push objects to array
      // this.aux_event_rubrik.forEach(element => {
      //   this.events_rubrik.push(element)
      // })

      // if (this.mobile.getValue() && (this.filter.getValue() == EventType.RUBRIK)) {
      //   if (event !== 'manual') this.events.next(this.search_list)
      // }
      // /* if (this.search_array.length > 0) {
      //   if (!this.mobile.getValue() || this.filter.getValue() != EventType.RUBRIK) {
      //     this.no_results.next(this.checkFullEmptyObject(this.search_list))
      //   } else {
      //     this.no_results.next(Object.keys(this.search_list).length === 0)
      //   }
      // } else {
      //   if (this.events.getValue().length > 0) this.no_results.next(false)
      // } */
      // this._tools.log('[TermineComponent]', 'Search List', this.search_list)
      // this._cdr.detectChanges()
      // this.addBanners()
    }
    // setTimeout(_ => {
    //   this.mobile_offset_visible.next(document.querySelectorAll('.event_display').length)
    // })
  }
  //rreset search and return to the original result (Default page)
  resetSearchbar() {
    this.search_value = ""
    this.search_display = false
  }

  /* checkFullEmptyObject(object) {
    return Object.keys(object).some(prop => object[prop].length > 0)
  } */

  search_mode: boolean = false
  getLocalstorageFilter() {
    if (safeGetStorageItem("rubrik_list", true)) {
      this.rubrik_arr_form = safeGetStorageItem("rubrik_list", true).split(";")
      this.rubrik_array.next(this.rubrik_arr_form)
      // @ts-ignore
      this.rubrik_filter = this.rubrik_arr_form
      // @ts-ignore
      this.rubrik.next(this.rubrik_arr_form)
    }
    if (safeGetStorageItem("formday", true)) {
      const formday = safeGetStorageItem("formday", true)
      // @ts-ignore
      this.formday.next(isNaN(formday) ? formday : +formday)
      const dayjsDate = dayjs(formday, 'DD.MM.YYYY').toDate()
      this.customDate.setValue(dayjsDate)
      if (this.formday.getValue() != 7) this.search_mode = true
    }
    if (safeGetStorageItem("formhour", true)) {
      this.search_mode = true
      this.formhour = parseInt(safeGetStorageItem("formhour", true))
    }
    if (safeGetStorageItem("startdate", true)) {
      this.search_mode = true
      this.startdate = safeGetStorageItem("startdate", true);
    }
    if (safeGetStorageItem("enddate", true)) {
      this.search_mode = true
      this.enddate = safeGetStorageItem("enddate", true)
    }
  }

  //format rubrik list from last search
  orte_filter_bar = []
  getOrteFilter() {
    var list = "";
    for (var i = 0; i < this.orte_filter_bar.length; i++) {
      if (this.orte_filter_bar[i]["adressname"]) list = list + "[ " + this.orte_filter_bar[i]["adressname"] + " ]";
      else list = list + "[ " + this.orte_filter_bar[i]['region'] + " ]";

    }
    if (list == "") return "[ " + this.translate.instant("termine.orte") + " ]"
    return list
  }

  original_ansicht = 'rubrik'

  pushHistory() {
    var stateObj = { foo: window.location.href }
    history.pushState(stateObj, "page 2", window.location.href)
  }
  backHistory() {
    window.history.back()
  }

  changeNewRubrik() {
    this.event_show.next(false)
    this.events_loaded.next(false)
    this.rubrik_arr_form = this.rubrik_array.getValue()
    this.globals.first_search = false
    this.sendSearch()
  }
  changeNewWann(i) {
    if (i.toString().indexOf('.') == -1) this.customDate.setValue('', { emitEvent: false, emitModelToViewChange: true })
    this.event_show.next(false)
    this.events_loaded.next(false)
    this.globals.first_search = false
    this.formday.next(i)
    this.formhour = -1
    this.sendSearch()
  }
  checkResetSearch(ev) {
    setTimeout(() => {
      this.onKey(ev)
    }, 50)
  }
  deleteSearch() {
    this.search.setValue('')
  }
}
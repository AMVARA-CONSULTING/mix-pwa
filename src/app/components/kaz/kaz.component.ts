import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ApplicationRef, Inject } from '@angular/core';
import { FormControl } from '@angular/forms'
import { HostListener } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { UserService } from '@services/user.service';
import { debounceTime } from 'rxjs/operators'
import { debounce } from 'app/decorators/debounce';
import { API_URL } from 'app/tokens';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { timer } from 'rxjs/internal/observable/timer';
import { SubSink, ToolsService } from '@services/tools.service';

declare const jQuery: any

@Component({
  selector: 'mix-kaz',
  templateUrl: './kaz.component.html',
  styleUrls: ['./kaz.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger(
      'fade', [
        transition(':enter', [
          style({ opacity: 0.0 }),
          animate('500ms', style({ opacity: 1 }))
        ])
      ]
    ),
    trigger("FoldOut", [
      transition("void => app", [
        style({ zIndex: "0" }),
        animate('500ms ease-in', keyframes([
          style({ opacity: "0", marginBottom: "-100px", transform: "translateY(-100px)" }),
          style({ opacity: "0", marginBottom: "-80px", transform: "translateY(-80px)" }),
          style({ opacity: "0", marginBottom: "-60px", transform: "translateY(-60px)" }),
          style({ opacity: "0.0", marginBottom: "-40px", transform: "translateY(-40px)" }),
          style({ opacity: "0.0", marginBottom: "-20px", transform: "translateY(-20px)" }),
          style({ opacity: "0.0", marginBottom: "-0px", transform: "translateY(0)" }),
          style({ opacity: "0.25", marginBottom: "-0px", transform: "translateY(0)" }),
          style({ opacity: "0.50", marginBottom: "-0px", transform: "translateY(0)" }),
          style({ opacity: "0.75", marginBottom: "-0px", transform: "translateY(0)" })
        ]))]),
      transition("app => void", [
        style({ opacity: "0" }),
        animate('150ms ease-in-out', keyframes([
          style({ opacity: "0.50", marginBottom: "0px", transform: "translateY(0px)" }),
          style({ opacity: "0.25", marginBottom: "0px", transform: "translateY(0px)" }),
          style({ opacity: "0", marginBottom: "0px", transform: "translateY(0px)" }),
        ]))]),
    ]),
    trigger("FoldOut", [
      transition("void => nothing", [style({ zIndex: "0" }),
      animate('0ms ease-in', keyframes([]))]),
    ])
  ]
})
export class KazComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  data$ = new BehaviorSubject<any[]>([])
  mail_data$ = new BehaviorSubject<any[]>([])
  email = new BehaviorSubject<string>('')
  text = new BehaviorSubject<string>('')
  screenWidth: number
  column_no = new BehaviorSubject<number>(0)
  maximum_col: number
  canclick = new BehaviorSubject<boolean>(false)
  animation_check = new BehaviorSubject<string>('app')
  search_array: any[] = [];
  search: boolean = false;
  search_value = new BehaviorSubject<string>('')
  search_display = new BehaviorSubject<boolean>(false)
  search_list: any[] = []
  rubrik_search_list = new BehaviorSubject<any[]>([])
  kategorie = new BehaviorSubject<string>('main')
  loaded_images: boolean = false
  search_control = new FormControl('')
  constructor(
    private router: Router,
    private _sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    public api: ApiService,
    public globals: GlobalsService,
    public user: UserService,
    private _cdr: ChangeDetectorRef,
    private _app: ApplicationRef,
    private _tools: ToolsService,
		@Inject(API_URL) private api_url: string
  ) {
    this.onResize()
    this._subs.sink = this.search_control.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => this.onKey(value))
    this._subs.sink = this.api.getAllRubriks().subscribe( data => this.data$.next(data) )
    var segs = 50
    if (this.globals.first_kaz_search) segs = 2000
    setTimeout(() => {
      this.getMail()
      this.getPin()
      this.globals.first_kaz_search = false;
    }, segs);
    this.api.getKazens()
    this._subs.sink = this.activatedRoute.queryParamMap.subscribe(params => {
      const rubrik = (params.get('v') || 'main').replace(/_/g, " ")
      if (this.kategorie.getValue() != rubrik) this.kategorie.next(rubrik)
    })
  }

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  //get list of mails of user
  getMail() {
    if (this.user.logged_in == true) {
      var form = new FormData;
      form.append("id", this.user.id)
      form.append("token", this.user.token)
      if (this.user.social != null) {
        form.append('authToken', this.user.social['authToken'])
        form.append('idToken', this.user.social['idToken'])
        form.append('idToken', this.user.social['idToken'])
        form.append("origin", this.user.social['provider'])
      } else {
        form.append("origin", 'mix')
      }
      this._subs.sink = this.api.getMail(form).subscribe(data => this.mail_data$.next(data))
    }
  }

  //change rubrik or go to Kontakte
  goKategorie(rubrik): void {
    if (rubrik == 'Kontakte') {
      this.router.navigate(['kontakte'])
    } else {
      this.kategorie.next(rubrik == this.kategorie.getValue() ? 'main' : rubrik)
      this._app.tick()
      setTimeout(_ => {
        this._cdr.markForCheck()
        this.triggerScroll()
      }, 0)
    }
  }

  // Trigger scroll on animation end
  triggerScroll() {
    var reference = document.getElementsByClassName("reference");
    if ( reference.length !== 0 ) {
      reference[0].scrollIntoView({ block: "start", behavior: "auto" });
    }
  }

  getID(index, item) {
    return item.rubrik
  }

  filtered_events = []

  //when entering data on search bar
  onKey(value) {
    this.search_value.next(value)
    // this.onResize()
    if (value) {
      this.search_display.next(true)
      this.kategorie.next('')
      var aux
      var new_rubr
      this.search_list = []
      this.rubrik_search_list.next([])
      this.search_array = this.search_value.getValue().split(" ")
      this.data$.getValue().forEach(kazen => {
        aux = jQuery(`<p>${kazen.text}</p>`).text()
        var hit = true;
        for (var i = 0; i < this.search_array.length; i++) {
          var regex = new RegExp(`${this.search_array[i]}`, 'gi');
          if (this._tools.checkRegex(regex, aux) == false) hit = false;
        }
        if (hit) {
          this.search_list.push(kazen)
          new_rubr = kazen['rubrik']
          if (kazen['rubrik'] == "Steppkes") new_rubr = 'Kinder'
          if (kazen['rubrik'] == "Töne") new_rubr = 'Musik'
          if (this.rubrik_search_list.getValue().includes(new_rubr) == false) {
            const rubrik_search_list = this.rubrik_search_list.getValue()
            rubrik_search_list.push(new_rubr)
            this.rubrik_search_list.next(rubrik_search_list)
            this.filtered_events.push(kazen)
          }
        }
      });
      window.scrollTo(0, 0)
      const rubrik_search_list = this.rubrik_search_list.getValue()
      rubrik_search_list.sort()
      this.rubrik_search_list.next(rubrik_search_list)
    }
    else {
      this.search_list = []
      this.search_display.next(false)
    }
  }
  enterSearch() {
    if (this.search_list.length > 0) this.search_display.next(true)
    this.search = true
  }
  resetSearch() {
    var proe = (document.getElementById("search") as HTMLTextAreaElement).value = "";
    this.search_value.next('')
    this.search_display.next(false)
    this.search = false
  }
  //gets the total number of kazenss of the rubrik
  getNumber(rubrik) {
    if (rubrik == 'Kinder') rubrik = 'Steppkes';
    if (rubrik == 'Musik') rubrik = 'Töne';
    var count = 0;
    this.search_list.forEach(kazen => {
      if (kazen["rubrik"] == rubrik) count++;
    });
    return count;

  }
  //sets background image based on the query result rubrik name for each row, adds jpg extension and a placeholder gradient
  getImage(image: string) {
    image = this.correctSpace(image);
    if (image == 'Töne') image = 'Musik'
    if (image == 'Steppkes') image = 'Kinder'
    image = image.replace(/%20/g, "-");
    if ((this.column_no.getValue() < 2) && (!this.loaded_images) && (this.globals.checkSafari() == false)) image = 'assets/kaz_img/' + image + '-mini.jpg';
    else {
      image = 'assets/kaz_img/' + image + '-mini.jpg'
      this.loaded_images = true;
    };
    return this._sanitizer.bypassSecurityTrustStyle(`url('assets/images/shadows/mix_layer_small.png'), url(${image})`);
  }

  //each time window is resized sets the current column mode for the grids
  @HostListener('window:resize')
  @debounce(500)
  onResize() {
    this.maximum_col = 3
    this.screenWidth = window.innerWidth
    this.column_no.next(1)
    this.animation_check.next('nothing')
    if (this.screenWidth >= 700) {
      this.column_no.next(2);
      this.animation_check.next('app')
    }
    if (this.search_display.getValue()) {
      if (this.screenWidth >= 700 && this.rubrik_search_list.getValue().length > 1) {
        this.column_no.next(3)
        this.animation_check.next('app')
      }
    } else {
      if (this.screenWidth >= 1200) {
        this.column_no.next(3)
        this.animation_check.next('app')
      }
    }
    if (this.column_no.getValue() > this.maximum_col) {
      this.column_no.next(this.maximum_col)
    }
    if (this.globals.checkSafari()) this.column_no.next(1)
  }

  correctSpace(text: string) {
    text = text.replace(/ /g, "%20");
    return text;
  }

  per_post

  ngOnInit() {
    this.globals.isIconTermine.next(false)
    this.globals.search.next(false)
    this.onResize()
    this._subs.sink = timer(500).subscribe(_ => this.canclick.next(true))
  }
  //get the id from selected kazen
  checkForm(event: any): void {
    if (typeof event != 'string') {
      this.email.next(event[0][0])
      this.text.next(event[0][1])
      this.per_post = event[0][2];
    } else {
      this.email.next(event)
    }
    if (!this.email.getValue()) {
      this.getMail();
    }
  }
  focusSearch() {
    if (!this.globals.search_focus) {
      document.getElementById("search").focus()
      this.globals.search_focus = true
    }
    return false
  }
  getBanner(banner_url) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api_url}/banner/${banner_url})`);
  }

  openBanner(url) {
    var href = "http://" + url;
    window.open(href);
  }

  //column organization on 3 and 2 columns mode
  checkClass(i: number) {
    if ([0, 6, 12, 18, 24].includes(i)) {
      return 1;
    }
    if ([1, 7, 13, 19, 25].includes(i)) {
      return 2;
    }
    if ([2, 8, 14, 20, 26].includes(i)) {
      return 3;
    }
    if ([3, 9, 15, 21, 27].includes(i)) {
      return 4;
    }
    if ([4, 10, 16, 22, 28].includes(i)) {
      return 5;
    }
    if ([5, 11, 17, 23, 29].includes(i)) {
      return 6;
    }
  }
  
  pin_data = []

  getPin() {
    if (this.user.logged_in) {
      var form = new FormData;
      form.append("id", this.user.id)
      form.append("token", this.user.token)
      if (this.user.social != null) {
        form.append('authToken', this.user.social['authToken'])
        form.append('idToken', this.user.social['idToken'])
        form.append('idToken', this.user.social['idToken'])
        form.append("origin", this.user.social['provider'])
      } else {
        form.append("origin", 'mix')
      }
      this._subs.sink = this.api.getPin(form).subscribe( data => this.pin_data = data )
    }
  }

  reloadPin(value) {
    if (value == 'good') {
      this.getPin()
    } else {
      if (!this.user.logged_in) {
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
    }
  }

  simple_alert: boolean = false;
  waiting: boolean = false;
  alert: boolean = false;
  pre_alert_message: string = "";
  message_alert: string = "";
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
  }

  reloadPinMail() {
    if (this.globals.exited_merkliste == true) {
      this.getMail()
      this.getPin()
      this.globals.exited_merkliste = false;
    }
  }
}

import { Component, OnInit, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy, Inject, OnDestroy } from '@angular/core';
import { ApiService } from '@services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '@services/user.service';
import { API_URL } from 'app/tokens';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SubSink, ToolsService } from '@services/tools.service';

//this module gets the info on the corresponding kaz category (Example:job) and displays it. It requests the info using window.location.href and spliting it
@Component({
  selector: 'mix-kaz-kategorie',
  templateUrl: './kaz-kategorie.component.html',
  styleUrls: ['./kaz-kategorie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KazKategorieComponent implements OnInit, OnDestroy {

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  _subs = new SubSink()

  data$ = [];
  banners = [];
  email = [];

  @Output() mail: EventEmitter<any> = new EventEmitter<any>();
  @Output() pin: EventEmitter<any> = new EventEmitter<any>();
  @Input() mail_data$: object;
  @Input() pin_data: any[];
  @Input() kazen_data: any[] = [];
  @Input() search_value: string = "";
  @Input() rubrik: string;
  @Input() kategorie: string

  kazens = new BehaviorSubject<any[]>([])

  constructor(
    private api: ApiService,
    private _sanitizer: DomSanitizer,
    public user: UserService,
    private _tools: ToolsService,
		@Inject(API_URL) private api_url: string
  ) { }

  passMail(kazemail: number, kaztext: string, per_post: boolean) {
    this.email = []
    this.email.push(kazemail)
    this.email.push(kaztext)
    this.email.push(per_post)
    this.mail.emit(Array(this.email))
  }
  passPin(value) {
    this.pin.emit(value);
  }
  addBanners() {
    this.kazens.next(this.data$)
  }

  ngOnInit() {
    this.kazen_data.forEach(array => {
      if (array[6] == this.rubrik) {
        this.data$.push(array);
      }
    })
    this.addBanners()
  }

  //check if user sent a mail to this kazen
  checkSend(hash) {
    if ((this.user.logged_in == true) && (this.mail_data$ != null)) {
      var value = false
      if ((this.mail_data$['response'] != null) && (this.mail_data$['data'] != null) && (!this.mail_data$['response'].startsWith("EX-"))) {
        var i
        var lenght = Object.keys(this.mail_data$['data']).length;
        for (i = 0; i < lenght; i++) {
          if (this.mail_data$['data'][i]["kazen_hash"] != null) {
            if (this.mail_data$['data'][i]["kazen_hash"] == hash) {
              value = true
            }
          }
        }
        return value
      }
    }
  }
  getBanner(banner_url) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api_url}/banner/${banner_url})`);
  }

  openBanner(url) {
    var href = "http://" + url;
    window.open(href);
  }

  //set or unset pin
  setPin(event) {
    var form = new FormData()
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
    form.append("hash", event['hashwert'])
    form.append("kazen_id", event['id'])
    form.append("rubrik", event['rubrik'])
    form.append("text", event['text'])
    form.append("text_typ", event['text_typ'])
    form.append("email", event['email'])
    form.append("chiffre", event['chiffre'])
    this._subs.sink = this.api.setPin(form).subscribe( data => {
        if (data != null) {
          if (data["response"] != null) {
            if (data["response"].startsWith('EX-') == true) {
              this.passPin('error')
            } else {
              this.passPin('good')
              this.user.getTotalPins()
            }
          }
        }
      }
    );
  }

  checkPin(hashwert) {
    var ret = false
    if (this.user.logged_in) {
      if ((this.pin_data["response"] == "ok") && (this.pin_data["data"] != null)) {
        ret = this.pin_data['data'].some(el => el['kazen_hash'] == hashwert)
      }
    }
    return ret
  }

  searchFilter(text) {
    if (text) {
      if (this.search_value.trim() == '') {
        return true
      } else {
        var search_array = this.search_value.split(" ")
        var hit = true
        search_array.forEach(element => {
          var aux = text.replace(/<span>/g, "")
          var regex = new RegExp(`${element}`, 'gi');
          if (!this._tools.checkRegex(regex, aux)) hit = false
        })
        return hit
      }
    } else {
      return false
    }
  }
}

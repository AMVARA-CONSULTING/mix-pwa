import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalsService } from '@services/globals.service';
import { Print } from '@other/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { PrintsDialog } from 'app/dialogs/prints/prints.dialog';
import { API_URL } from 'app/tokens';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SubSink } from '@services/tools.service';

@Component({
  selector: 'mix-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  constructor(
    private api: ApiService,
    private _sanitizer: DomSanitizer,
    public globals: GlobalsService,
    private _dialog: MatDialog,
		@Inject(API_URL) private api_url: string
  ) { }

  prints$ = new BehaviorSubject<Print[]>([])
  all_prints: Print[] = []
  print_main$ = new BehaviorSubject<Print>(null)
  selected_print = ""
  mobile: boolean
  page = 1
  max_pages = 0

  ngOnDestroy() {
    this._subs.unsubscribe()
    document.getElementsByTagName("body")[0].style.backgroundColor = 'rgba(255, 256, 256, 1)';
    this.globals.mobile_keyboard = false;
  }
  ngOnInit() {
    this.onResize()
    document.getElementsByTagName("body")[0].style.backgroundColor = 'rgba(26, 26, 26, 1)';
    this._subs.sink = this.api.getPrint().subscribe( data => {
      this.prints$.next(data.slice(1, 24))
      this.all_prints = data
      this.print_main$.next(data[0])
    })
  }

  @HostListener('window:resize') onResize() {
    if (window.innerWidth <= 1200) {
      this.mobile = true
    } else {
      this.mobile = false
      if (this.globals.fullscreen_print == true) {
        this.backHistory()
      }
    }
  }

  getSelectedBackground(name) {
    var url = this.api_url + 'data/print_mix/' + name + '/pubData/source/images/pages/page' + this.page + '.jpg'
    return this._sanitizer.bypassSecurityTrustStyle('linear-gradient(rgba(29, 29, 29, 0), rgba(16, 16, 23, 0)), url(' + url + ')');
  }
  getPageBackground(name, n) {
    var url = this.api_url + 'data/print_mix/' + name + '/pubData/source/images/pages/page' + (this.page + n) + '.jpg'
    return this._sanitizer.bypassSecurityTrustStyle('linear-gradient(rgba(29, 29, 29, 0), rgba(16, 16, 23, 0)), url(' + url + ')');
  }
  openPdf(name) {
    var year = name.split("_")[0]
    var month = name.split("_")[1]
    var url = this.api_url + 'data/print_mix/' + name + '/pubData/source/MIX_' + month + "_" + year.substring(2) + ".pdf"
    window.open(url);
  }
  changePage(event) {
    var number = parseInt(event.target.value)
    if ((number > 0) && (number < this.max_pages)) {
      this.page = number;
    }
  }
  preventDefault(e) {
    e.preventDefault();
  }
  @HostListener('window:popstate') onBack() {
    if (!this.globals.menu.getValue()) {
      if ((this.selected_print != '') && !this.globals.fullscreen_print) {
        this.selected_print = ''
        this.globals.mobile_keyboard = false
      }
      if (this.globals.fullscreen_print) {
        this.globals.fullscreen_print = false
      }
    }
  }
  backHistory() {
    window.history.back()

  }

  getLink(name) {
    return this._sanitizer.bypassSecurityTrustUrl(`http://${location.hostname}/v1/data/print_mix/${name}/index.html`)
  }

  openPrintArchive() {
    this._dialog.open(PrintsDialog, {
      panelClass: 'prints-dialog',
      data: this.all_prints,
      minWidth: '280px',
      autoFocus: false
    })
  }
}

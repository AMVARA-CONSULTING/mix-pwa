import { Component, ChangeDetectionStrategy, Inject, OnInit, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { Event } from "@other/interfaces";
import { FormControl } from "@angular/forms";
import { KinoPlaceDialog } from "../kino-place/kino-place.dialog";
import { ShareDialog } from "../share/share.dialog";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { SubSink } from "@services/tools.service";

declare const dayjs: any

@Component({
  selector: 'mix-kino-dates',
  templateUrl: 'kino-dates.dialog.html',
  styleUrls: ['./kino-dates.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KinoDatesDialog implements OnInit, OnDestroy {

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  _subs = new SubSink()

  constructor(
    public dialogRef: MatDialogRef<KinoDatesDialog>,
    private _dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public events: { rows: Event[], event: Event }
  ) {
    this._subs.sink = this.place.valueChanges.subscribe(place => {
      this.days.next(place)
      const dates = Object.keys(place).sort((a, b) => dayjs(a, 'YYYY-MM-DD') - dayjs(b, 'YYYY-MM-DD'))
      this.hours.next(place[dates[0]])
      this.activeDay.next(dates[0])
    })
  }

  openShare(event) {
    this._dialog.open(ShareDialog, { width: '350px', data: event })
  }

  activeDay = new BehaviorSubject<string>('')

  viewHours(day) {
    this.activeDay.next(day.key)
    this.hours.next(day.value)
  }

  openPlaceInfo() {
    const place = this.place.value[Object.keys(this.place.value)[0]][0].adressname
    const regions = this.places.getValue()
    for (let region in regions) {
      if (regions[region][place]) {
        this._dialog.open(KinoPlaceDialog, {
          data: regions[region][place][Object.keys(regions[region][place])[0]][0],
          maxWidth: '95vw',
          minWidth: '300px'
        })
        break
      }
    }
  }

  ngOnInit() {
    // Region level
    const regions = this.events.rows.reduce((r, a) => {
      r[a.region] = r[a.region] || []
      r[a.region].push(a)
      return r
    }, {})
    // Places level
    for (let region in regions) {
      regions[region] = regions[region].reduce((r, a: Event) => {
        r[a.adressname] = r[a.adressname] || []
        r[a.adressname].push(a)
        return r
      }, {})
      // Days level
      for (let place in regions[region]) {
        regions[region][place] = regions[region][place].reduce((r, a: Event) => {
          r[a.datum] = r[a.datum] || []
          r[a.datum].push(Object.assign(a, { eventid: a.eventid, hour: a.uhrzeit }))
          return r
        }, {})
      }
    }
    this.places.next(regions)
    if ( Object.keys(regions).length === 1 && Object.keys(regions[Object.keys(regions)[0]]).length === 1 ) {
      this.place.disable()
    }
    // Auto Select from detail
    const place = this.events.event.adressname
    for (let region in regions) {
      if (regions[region][place]) {
        this.place.setValue(regions[region][place])
        const dates = Object.keys(regions[region][place]).sort((a, b) => dayjs(a, 'YYYY-MM-DD') - dayjs(b, 'YYYY-MM-DD'))
        this.days.next(regions[region][place])
        this.hours.next(regions[region][place][dates[0]])
        this.activeDay.next(dates[0])
        break
      }
    }
    // Disable no-scroll class preventing animations bug
    setTimeout(_ => {
      try {
        document.querySelector('mix-kino-dates .mat-dialog-content').classList.remove('no-scroll');
        (document.querySelector('.cdk-global-scrollblock') as HTMLElement).style.overflowY = 'auto'
      } catch (err) { }
    }, 600)
  }

  place = new FormControl('')

  days = new BehaviorSubject<string[]>([])
  hours = new BehaviorSubject<any[]>([])

  places = new BehaviorSubject<any>({})

}
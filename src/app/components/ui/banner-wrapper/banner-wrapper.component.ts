import { Component, OnChanges, Input, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SubSink } from '@services/tools.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'mix-banner-wrapper',
  templateUrl: './banner-wrapper.component.html',
  styleUrls: ['./banner-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerWrapperComponent implements OnChanges, OnDestroy {

  _subs = new SubSink()

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  constructor(
    private _breakpointObserver: BreakpointObserver
  ) {
    // Breakpoint for tablet big
    this._subs.sink = this._breakpointObserver.observe([
      '(min-width: 751px) and (max-width: 1199px)',
    ]).subscribe(result => {
      if (result.matches) this.banners.next(1)
    })
    // Breakpoint for tablet small
    this._subs.sink = this._breakpointObserver.observe([
      '(max-width: 750px)'
    ]).subscribe(result => {
      if (result.matches) this.banners.next(2)
    })
    // Breakpoint for Desktop
    this._subs.sink = this._breakpointObserver.observe([
      '(min-width: 1200px)'
    ]).subscribe(result => {
      if (result.matches) this.banners.next(0)
    })
  }
  
  banners = new BehaviorSubject<number>(0)

  ngOnChanges() {
    this.items.next(Array(this.quantity).fill(null))
  }

  items = new BehaviorSubject<any[]>([])

  @Input() quantity: number = 0

}

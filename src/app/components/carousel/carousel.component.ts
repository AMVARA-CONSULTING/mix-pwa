import { Component, Input, ViewChild, OnChanges, ChangeDetectionStrategy, EventEmitter, Output, SimpleChanges, ElementRef, NgZone, ViewChildren, QueryList } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialog } from 'app/dialogs/share/share.dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
declare const $: any

@Component({
  selector: 'mix-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements OnChanges {

  constructor(
    public _globals: GlobalsService,
    private _dialog: MatDialog,
    private _zone: NgZone
  ) { }

  @ViewChild('owlElement', { static: true }) owlElement: ElementRef

  owlElementjQuery

  hammering = false

  ready = new BehaviorSubject<boolean>(false)

  @Input() items = []
  @Input() filter = ''

  @ViewChildren('list') list: QueryList<any>

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(_ => {
      this._zone.runOutsideAngular(_ => {
        this.owlElementjQuery = $(this.owlElement.nativeElement)
        if (!changes.items.firstChange) {
          this.owlElementjQuery.trigger('destroy.owl.carousel')
          this.owlElementjQuery.find('.owl-item').remove()
          this.owlElementjQuery.removeClass("owl-center owl-loaded owl-text-select-on")
        }
        if (changes.items.currentValue) {
          this.owlElementjQuery.owlCarousel({
            margin: 14,
            dots: true,
            nav: false,
            smartSpeed: 300,
            items: changes.items.currentValue.length,
            slideBy: 'page',
            onInitialized: this.handleChanged.bind(this),
            onDrag: this.dragStarted.bind(this),
            onDragged: this.dragFinished.bind(this),
            onChanged: this.handleChanged.bind(this),
            responsive: {
              0: { items: 1 },
              600: { items: 3 },
              1000: { items: 4 },
              1450: { items: 5 }
            }
          })
        }
        let event
        if (typeof(Event) === 'function') {
          event = new Event('resize')
          window.dispatchEvent(event)
        } else {
          event = document.createEvent('Event')
          event.initEvent('resize', true, true)
        }
        setTimeout(_ => this.ready.next(true))
      })
    })
  }

  transient

  handleChanged(event) {
    this.currentPage.next(event.page.index < 0 ? 0 : event.page.index)
    if (event.page.count === 0) {
      const itemsPerPage = event.page.size
      const pages = this.items.length / itemsPerPage
      if (Number.isInteger(pages)) {
        this.totalPages.next(pages)
      } else {
        this.totalPages.next(Math.trunc(pages) + 1)
      }
    } else {
      this.totalPages.next(event.page.count)
    }
  }

  currentPage = new BehaviorSubject<number>(0)
  totalPages = new BehaviorSubject<number>(0)

  dragStarted(event) {
    this.hammering = true
    this.initialCurrent = event.relatedTarget.current()
  }

  initialCurrent !: any

  dragFinished(event) {
    var owl = event.relatedTarget;
    var draggedCurrent = owl.current()
    if (draggedCurrent > this.initialCurrent) {
      owl.current(this.initialCurrent)
      owl.next()
    } else if (draggedCurrent < this.initialCurrent) {
      owl.current(this.initialCurrent)
      owl.prev()
    }
    setTimeout(() => this.hammering = false, 300)
  }

  next() {
    this.owlElementjQuery.trigger('next.owl.carousel');
  }

  previous() {
    this.owlElementjQuery.trigger('prev.owl.carousel');
  }

  openShare(e: MouseEvent, event): void {
    e.stopPropagation()
    this._dialog.open(ShareDialog, { width: '350px', data: event })
  }

  emitEvent(ev): void {
    if (!this.hammering) this.event.emit(ev)
  }

  @Output() event: EventEmitter<any> = new EventEmitter<any>()

}

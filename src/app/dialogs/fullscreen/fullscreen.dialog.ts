import { Component, ChangeDetectionStrategy, Inject, OnInit, HostListener, ElementRef, ChangeDetectorRef, NgZone, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SafeStyle, DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ToolsService } from "@services/tools.service";
import { API_URL } from "app/tokens";
import { Event } from "@other/interfaces";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

export enum KEY_CODE {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37
}

declare const Hammer: any

@Component({
  selector: 'mix-fullscreen',
  templateUrl: 'fullscreen.dialog.html',
  styleUrls: ['./fullscreen.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullscreenDialog implements OnInit, OnDestroy {

  constructor(
    public dialogRef: MatDialogRef<FullscreenDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Event | any,
    private _sanitizer: DomSanitizer,
    private _ref: ElementRef,
    private _cdr: ChangeDetectorRef,
    private _zone: NgZone,
    private _tools: ToolsService,
		@Inject(API_URL) private api_url: string
  ) {
    this.trailerWidth.next(window.innerWidth)
    this.trailerHeight.next(+(this.trailerWidth.getValue() * 9 / 16).toFixed(0))
    this.src.subscribe(src => this.IEImage.next(src.replace('/t/', '/').replace('_t.jpg', '_org.jpg')))
  }

  ngOnDestroy() {
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
  }

  trailerWidth = new BehaviorSubject<number>(0)
  trailerHeight = new BehaviorSubject<number>(0)
  trailer_url = new BehaviorSubject<SafeResourceUrl>(this._sanitizer.bypassSecurityTrustResourceUrl(``))

  @HostListener('window:orientationchange') orientationHandler() {
    setTimeout(_ => {
      this.trailerWidth.next(window.innerWidth)
      this.trailerHeight.next(+(this.trailerWidth.getValue() * 9 / 16).toFixed(0))
      this._cdr.markForCheck()
    })
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
      if (this.currentIndex.getValue() < (this.items.getValue().length - 1)) {
        this.next()
      }
    }
    if (event.keyCode === KEY_CODE.LEFT_ARROW) {
      if (this.currentIndex.getValue() > 0) {
        this.previous()
      }
    }
  }

  fullscreen = new BehaviorSubject<boolean>(false)

  toggleFullscreen() {
    this.fullscreen.next(this._tools.toggleFullScreen())
    setTimeout(_ => window.scrollTo(0, 1))
  }

  close() {
    this.dialogRef.close(this.currentIndex.getValue())
  }

  ngOnInit() {
    setTimeout(_ => window.scrollTo(0, 1))
    const items = []
    this.isIE.next(this._tools.isIE())
    if (this.data.rubrik === 'Kino') {
      const maxItems: number = this.data.totalImages
      const image_prefix: string = this.data.image_name
      for (let i = 0; i < maxItems; i++) {
        items.push(`${image_prefix}_${i}`)
      }
      if (this.data.trailerurl) {
        items.splice(1, 0, '');
      }
      if (!this.data.trailerurl) this.data.trailerurl = ''
      if (this.data.trailerurl.toString().indexOf('http') > -1) {
        const url = new URL(this.data.trailerurl)
        const searchParams = new URLSearchParams(url.search)
        this.trailer_url.next(this._sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${searchParams.get('v')}`))
      } else {
        this.trailer_url.next(this._sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${this.data.trailerurl}`))
      }
    } else {
      const images = this.data.images
      for (let i = 0; i < images.length; i++) {
        try {
          items.push(`${images[i].filename}`)
        } catch (err) { }
      }
    }
    this.items.next(items)
    this.currentIndex.next(this.data.currentIndex)
    const imageSizes = this.getMultidimensionImage(items[this.data.currentIndex])
    this.src.next(imageSizes.small)
    this.srcset.next(`${imageSizes.medium} 1024w, ${imageSizes.large} 1920w`)
    if (this.data.currentIndex === 1 && this.data.rubrik === 'Kino' && !!this.data.trailerurl) this.showTrailer.next(true)
    const elem = this._ref.nativeElement
    this._zone.runOutsideAngular(_ => {
      const hammer = new Hammer(elem)
      hammer.domEvents = true
      hammer.on('swipeleft swiperight', (event) => {
        if (event.type === 'swipeleft') {
          this.next()
          this._cdr.detectChanges()
        } else if (event.type === 'swiperight') {
          this.previous()
          this._cdr.detectChanges()
        }
      })
    })
  }

  currentIndex = new BehaviorSubject<number>(0)

  items = new BehaviorSubject<any[]>([])

  showTrailer = new BehaviorSubject<boolean>(false)

  isIE = new BehaviorSubject<boolean>(false)
  IEImage = new BehaviorSubject<string>('')

  next(e?: MouseEvent) {
    if (e) {
      e.stopPropagation()
      e.stopImmediatePropagation()
      e.preventDefault()
    }
    const items = this.items.getValue()
    if (this.currentIndex.getValue() + 1 >= items.length) {
      const imageSizes = this.getMultidimensionImage(items[0])
      this.src.next(imageSizes.small)
      this.srcset.next(`${imageSizes.medium} 1024w, ${imageSizes.large} 1920w`)
      this.currentIndex.next(0)
      if (this.data.rubrik === 'Kino' && !!this.data.trailerurl) this.showTrailer.next(this.currentIndex.getValue() === 1)
    } else {
      const imageSizes = this.getMultidimensionImage(items[this.currentIndex.getValue() + 1])
      this.src.next(imageSizes.small)
      this.srcset.next(`${imageSizes.medium} 1024w, ${imageSizes.large} 1920w`)
      this.currentIndex.next(this.currentIndex.getValue() + 1)
      if (this.data.rubrik === 'Kino' && !!this.data.trailerurl) this.showTrailer.next(this.currentIndex.getValue() === 1)
    }
  }

  previous(e?: MouseEvent) {
    if (e) {
      e.stopPropagation()
      e.stopImmediatePropagation()
      e.preventDefault()
    }
    const items = this.items.getValue()
    if (this.currentIndex.getValue() - 1 < 0) {
      const imageSizes = this.getMultidimensionImage(items[items.length - 1])
      this.src.next(imageSizes.small)
      this.srcset.next(`${imageSizes.medium} 1024w, ${imageSizes.large} 1920w`)
      this.currentIndex.next(items.length - 1)
      if (this.data.rubrik === 'Kino' && !!this.data.trailerurl) this.showTrailer.next(this.currentIndex.getValue() === 1)
    } else {
      const imageSizes = this.getMultidimensionImage(items[this.currentIndex.getValue() - 1])
      this.src.next(imageSizes.small)
      this.srcset.next(`${imageSizes.medium} 1024w, ${imageSizes.large} 1920w`)
      this.currentIndex.next(this.currentIndex.getValue() - 1)
      if (this.data.rubrik === 'Kino' && !!this.data.trailerurl) this.showTrailer.next(this.currentIndex.getValue() === 1)
    }
  }

  getMultidimensionImage(image: string) {
    const prefix = this.data.rubrik === 'Kino' ? 'photos' : 'termine_photos'
    //image = encodeURIComponent(image)
    // Use the updateOn field for caching version
    let timestamp
    try {
      timestamp = this.data.updatedOn.replace(/[^0-9]/g, '')
    } catch (err) {
      timestamp = 2
    }
    image = encodeURIComponent(image)
    return {
      small: `${this.api_url}data/${prefix}/s/${image}_s.jpg?version=${timestamp}`,
      medium: `${this.api_url}data/${prefix}/m/${image}_m.jpg?version=${timestamp}`,
      large: `${this.api_url}data/${prefix}/${image}_org.jpg?version=${timestamp}`
    }
  }

  image_url = new BehaviorSubject<SafeStyle>(null)
  srcset = new BehaviorSubject<string>('')
  src = new BehaviorSubject<string>('')

}
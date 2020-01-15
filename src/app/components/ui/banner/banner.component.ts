import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { BannerService } from '@services/banner.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Banner } from '@other/interfaces';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { API_URL } from 'app/tokens';

@Component({
  selector: 'mix-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent implements OnInit {

  banner = new BehaviorSubject<Banner>(null)
  bannerUrl = new BehaviorSubject<SafeStyle>('')

  constructor(
    private _banner: BannerService,
    private _sanitizer: DomSanitizer,
		@Inject(API_URL) private api_url: string
  ) { }

  ngOnInit() {
    this.banner.next(this._banner.getAvailableBanner())
    // Preload banner image, and protect owner's copyright
    // Search on Cache
    if (this._banner.cache[this.banner.getValue().key]) {
      this.bannerUrl.next(this._sanitizer.bypassSecurityTrustStyle(`url(${this._banner.cache[this.banner.getValue().key]})`))
    } else {
      var xhr = new XMLHttpRequest()
      let _this = this
      xhr.onload = function () {
        var reader = new FileReader()
        reader.onloadend = function () {
          _this.bannerUrl.next(_this._sanitizer.bypassSecurityTrustStyle(`url(${reader.result})`))
          _this._banner.cache[_this.banner.getValue().key] = reader.result
        }
        reader.readAsDataURL(xhr.response)
      }
      xhr.open('GET', `${_this.api_url}banner/${_this.banner.getValue().bild}`)
      xhr.responseType = 'blob'
      xhr.send()
    }
  }

}

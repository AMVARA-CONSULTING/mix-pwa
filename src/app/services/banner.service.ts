import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Banner } from '@other/interfaces';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { GlobalsService } from './globals.service';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(
    private _api: ApiService,
    private _data: GlobalsService
  ) { }

  loadingBanners = new BehaviorSubject<boolean>(true)

  cache: any[] = []

  // All banner items
  banners: Banner[] = []

  // Banners available for next retrieve
  availableBanners: number[] = []

  getBanners() {
    // Get banners
    let sub = this._api.getKazenBanner()
    sub.subscribe(banners => {
      // Remove offset object, looks not necessary
      if (banners[0].hasOwnProperty('offset')) banners.splice(0, 1)
      // Assign key property as Banner ID
      banners.forEach((banner, index) => {
        banners[index].key = index
      })
      this.banners = banners
      // Get keys
      this.availableBanners = this.banners.map(b => b.key)
      this.loadingBanners.next(false)
      this._data.banners_loaded.next(true)
    })
  }


  getAvailableBanner(): Banner {
    // If there are available banners, get the next and remove it
    if (this.availableBanners.length > 0) {
      const banner = this.banners[this.availableBanners[0]]
      this.availableBanners.splice(0, 1)
      return banner
    } else {
      // If not, reassign the original banner keys
      this.availableBanners = this.banners.map(b => b.key)
      const banner = this.banners[this.availableBanners[0]]
      this.availableBanners.splice(0, 1)
      return banner
    }
  }

  resetOrder(): void {
    // If not, reassign the original banner keys
    this.availableBanners = this.banners.map(b => b.key)
  }

}

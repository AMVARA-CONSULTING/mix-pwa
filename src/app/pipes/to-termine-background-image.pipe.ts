import { Pipe, PipeTransform, Inject } from '@angular/core';
import { Event } from '@other/interfaces';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import memo from 'memo-decorator';
import { API_URL } from 'app/tokens';
import { GlobalsService } from '@services/globals.service';

@Pipe({
  name: 'toTermineBackgroundImage'
})
export class ToTermineBackgroundImagePipe implements PipeTransform {

  constructor(
    private _sanitizer: DomSanitizer,
    public _globals: GlobalsService,
		@Inject(API_URL) private api_url: string
  ) { }

  @memo()
  transform(event_data: Event ): SafeStyle {
    // Use the updateOn field for caching version
    let timestamp
    try {
      // @ts-ignore
     timestamp = event_data.updatedOn.replace(/[^0-9]/g, '')
    } catch (err) {
      timestamp = 2
    }
    
    // The image folder change, depending on the rubrik ... KINO is different
    const eventFolder = event_data.rubrik === 'Kino' ? 'photos' : 'termine_photos'

    // The image size changes if on merkliste ... merkliste is "m", rest is "s" .... #1692
    let imageSize = (this._globals.merkliste_page.value ) ? 'm' : 's'

    // console.log("AMVARA - Merkliste:", this._globals.merkliste_page.value)

    if (event_data.image_name && event_data.totalImages > 0) {
      // Obtain background image from the old way
      const url = this.api_url + `data/${eventFolder}/${imageSize}/` + encodeURIComponent(event_data['image_name']) + "_0_"+`${imageSize}.jpg?version=${timestamp}`
      return this._sanitizer.bypassSecurityTrustStyle("url('assets/images/shadows/mix_layer_small.png'), url(" + url + ")")
    } else if (event_data.images && event_data.images.length > 0) {
      // Obtain background image from the new way
      const url = this.api_url + `data/${eventFolder}/${imageSize}/` + encodeURIComponent(event_data['images'][0]) + `_${imageSize}.jpg?version=${timestamp}`
      return this._sanitizer.bypassSecurityTrustStyle("url('assets/images/shadows/mix_layer_small.png'), url(" + url + ")")
    } else {
      // No image found in any way
      return this._sanitizer.bypassSecurityTrustStyle(`linear-gradient(rgba(110, 29, 29, 0), rgba(191, 16, 49, 0)),linear-gradient(rgba(110, 29, 29, 1), rgba(191, 16, 49, 1))`)
    }
  }

}

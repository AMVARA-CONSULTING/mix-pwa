import { Pipe, PipeTransform, Inject } from '@angular/core';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import memo from 'memo-decorator';
import { API_URL } from 'app/tokens';

@Pipe({
  name: 'toThumbnailBackgroundImage'
})
export class ToThumbnailBackgroundImagePipe implements PipeTransform {

  constructor(
    private _sanitizer: DomSanitizer,
		@Inject(API_URL) private api_url: string
  ) { }

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(event: any, index: number): SafeStyle {

     // Use the updateOn field for caching version
     let timestamp
     try {
      timestamp = event.updatedOn.replace(/[^0-9]/g, '')
     } catch (err) {
       timestamp = 2
     }
    if (event.rubrik === 'Kino') {
      // Is Kino
      index = index != -1 ? index : 0;
      return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api_url}data/photos/s/${encodeURIComponent(event.image_name)}_${index}_s.jpg?version=${timestamp})`)
    } else {
      // Is not Kino
      try {
        return this._sanitizer.bypassSecurityTrustStyle(`url(${this.api_url}data/termine_photos/s/${encodeURIComponent(event.images[index].filename)}_s.jpg?version=${timestamp})`)
      } catch (err) { }
    }
  }

}

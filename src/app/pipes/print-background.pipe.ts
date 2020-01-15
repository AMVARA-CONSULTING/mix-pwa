import { Pipe, PipeTransform, Inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { API_URL } from 'app/tokens';

@Pipe({
  name: 'printBackground'
})
export class PrintBackgroundPipe implements PipeTransform {

  constructor(
    private _sanitizer: DomSanitizer,
		@Inject(API_URL) private api_url: string
  ) { }

  transform(name: string, size): any {
    let prefix = ''
    if (size && size == 'small') prefix = '/iphone/images'
    if (size && size == 'big') prefix = '/ipad/images'
    const url = this.api_url + 'data/print_mix/' + name + `/pubData/source/images${prefix}/pages/page1.jpg`
    return this._sanitizer.bypassSecurityTrustStyle('linear-gradient(rgba(29, 29, 29, 0), rgba(16, 16, 23, 0)), url(' + url + ')');
  }

}

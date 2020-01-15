import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'insertMarktplatzBanners'
})
export class InsertMarktplatzBannersPipe implements PipeTransform {

  @memo()
  transform(kazens: any[]): any[] {
    let kazen_copy = kazens.concat([])
    let offset = 2
    let length = kazen_copy.length
    let i = 1
    for (; i < length; i++) {
      if (offset < kazen_copy.length) {
        kazen_copy.splice(offset, 0, { rubrik: 'banner' })
        length = kazen_copy.length
      }
      offset = offset + Math.floor(Math.random() * 10) + 5
    }
    return kazen_copy
  }

}

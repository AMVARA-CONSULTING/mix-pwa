import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'excludeTabletMiddleBanner'
})
export class ExcludeTabletMiddleBannerPipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(banners: any[], qt): any[] {
    let banner_copy = banners.concat([])
    if ((qt === 1 || qt === 2) && banner_copy.length === 3) {
      banner_copy.splice(1, qt)

    }
    return banner_copy
  }

}

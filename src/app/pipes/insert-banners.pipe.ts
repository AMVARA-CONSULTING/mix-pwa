import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '@other/interfaces';
import memo from 'memo-decorator';

@Pipe({
  name: 'insertBanners'
})
export class InsertBannersPipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(events: Event[], banner_difference: number): Event[] {
    // Slice prevents this pipe to overwrite the source events
    events = events.slice()
    let length = events.length
    let i = 0
    let lastBannerPosition = 0
    for (; i < length; i++) {
      if (i % banner_difference === 0 && i !== 0) {
        // @ts-ignore
        events.splice(i, 0, { box_type: 'banner', rubrik: 'banner' })
        lastBannerPosition = i
        length = events.length
      } else {
        events[i].box_type = 'event'
      }
    }
    // Is there more than 3 events between the last banner and the total length, add 1 banner to the end
    const banner_threshold = 3 // Adjust at tour own
    if (events.length - 1 - lastBannerPosition >= banner_threshold) {
      // @ts-ignore
      // events.splice(events.length - 1, 0, { box_type: 'banner', rubrik: 'banner' })
    }
    if (events.length <= 3 && events.length > 0) {
      // @ts-ignore
      events.splice(4, 0, { box_type: 'banner', rubrik: 'banner' })
    }
    length = events.length
    i = 0
    for (; i < length; i++) {
      // Remove consecutive banner rows. #1742 - Testcase C
      if (events[i-1] && events[i-1].rubrik == 'banner' && events[i].rubrik == 'banner') {
        events.splice(i, 1)
        length = events.length
      }
    }
    return events
  }

}

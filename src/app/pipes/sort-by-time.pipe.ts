import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '@other/interfaces';
import memo from 'memo-decorator';

declare const dayjs: any

@Pipe({
  name: 'sortByTime'
})
export class SortByTimePipe implements PipeTransform {

  @memo()
  transform(events: Event[]): Event[] {
    events.sort((a, b) => {
      const returnTime = dayjs(`${a.datum} ${a.uhrzeit}`, 'YYYY-MM-DD HH:mm') - dayjs(`${b.datum} ${b.uhrzeit}`, 'YYYY-MM-DD HH:mm')
      if (returnTime === 0) {
        if (a.titel < b.titel) return -1
        if (a.titel > b.titel) return 1
        return 0
      }
      return returnTime
    })
    return events
  }

}

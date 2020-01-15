import { Pipe, PipeTransform } from '@angular/core';
import { KinoRelatedDate } from '@other/interfaces';
import memo from 'memo-decorator';

declare const dayjs: any

@Pipe({
  name: 'sortDateHours'
})
export class SortDateHoursPipe implements PipeTransform {

  @memo()
  transform(hours: KinoRelatedDate[]): any {
    hours.sort((a, b) => {
      return dayjs(a.uhrzeit, 'HH:mm') - dayjs(b.uhrzeit, 'HH:mm')
    })
    return hours
  }

}

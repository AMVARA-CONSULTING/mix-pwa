import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

declare const dayjs: any

@Pipe({
  name: 'wannValue'
})
export class WannValuePipe implements PipeTransform {

  constructor(private _translate: TranslateService) { }

  transform(day: number | string): Observable<string> {
    // Detect if the value of day is a custom date
    if (day.toString().indexOf('.') > -1) {
      const dates = day.toString().split('-')
      // If both dates are the same, the show it simple
      if (dates[0] == dates[1]) return of(dates[0])
      const begin = dayjs(dates[0], 'DD.MM.YYYY')
      const end = dayjs(dates[1], 'DD.MM.YYYY')
      const diff = begin.diff(end, 'day')
      return of(`Datum (${Math.abs(diff)+1})`)
    } else {
      let str = "termine.waswannwo.heute"
      switch (day) {
        case 0: str = "termine.waswannwo.heute"; break
        case 1: str = "termine.waswannwo.morgen"; break
        case 12: str = "termine.waswannwo.heutemorgen"; break
        case 'freitag': str = "termine.waswannwo.freitag"; break
        case 'freitag-late': str = "termine.waswannwo.freitag_late"; break
        case 'samstag': str = "termine.waswannwo.samstag"; break
        case 'samstag-late': str = "termine.waswannwo.samstag_late"; break
        case 'sonntag': str = "termine.waswannwo.sonntag"; break
        case 'sonntag-late': str = "termine.waswannwo.sonntag_late"; break
        case 7: str = "termine.waswannwo.7days"; break
        case 'heute-late': str = "termine.waswannwo.heute_late"; break
        case 'tomorrow-late': str = "termine.waswannwo.tomorrow"; break
        case 30: str = "termine.waswannwo.30days"; break
        case 8: str = "termine.waswannwo.diese_woche"; break
        case 10: str = "termine.waswannwo.wochenende"; break
        case 9: str = "termine.waswannwo.nachste_woche"; break
        case 50: str = "termine.waswannwo.wann_egal"; break
        default:
      }
      return this._translate.get(str)
    }
  }

}

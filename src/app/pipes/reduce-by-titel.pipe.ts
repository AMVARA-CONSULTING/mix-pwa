import { Pipe, PipeTransform, Host } from '@angular/core';
import { Event, EventType } from '@other/interfaces';
import { TermineComponent } from '@components/termine/termine.component';

@Pipe({
  name: 'reduceByTitel'
})
export class ReduceByTitelPipe implements PipeTransform {

  constructor(
    @Host() private _termine: TermineComponent
  ) { }

  transform(events: Event[]): Event[] {

    // Get unique rubriks
    try {
      const rubriks = events.reduce((r, a) => {
        r[a.rubrik] = r[a.rubrik] || []
        r[a.rubrik].push(a)
        return r
      }, {})
      for (let rubrik in rubriks) {
        if (rubrik === 'Kino') {
          rubriks[rubrik] = rubriks[rubrik].reduce((r, a: Event) => {
            r[a.titel] = r[a.titel] || []
            r[a.titel].push(a)
            return r
          }, {})
          for (let title in rubriks[rubrik]) {
            rubriks[rubrik][title][0]['events_count'] = rubriks[rubrik][title].length
            rubriks[rubrik][title] = rubriks[rubrik][title][0]
          }
        } else {
          rubriks[rubrik] = rubriks[rubrik].reduce((r, a: Event) => {
            r[`${a.titel} - ${a.adressname}`] = r[`${a.titel} - ${a.adressname}`] || []
            r[`${a.titel} - ${a.adressname}`].push(a)
            return r
          }, {})
          for (let title in rubriks[rubrik]) {
            rubriks[rubrik][title][0]['events_count'] = rubriks[rubrik][title].length
            rubriks[rubrik][title] = rubriks[rubrik][title][0]
          }
        }
      }
      // Construct new events array
      events = []

      for (let rubrik in rubriks) {
        for (let title in rubriks[rubrik]) {
          events.push(rubriks[rubrik][title])
        }
      }

      // Push total to termine component
      if (this._termine.filter.getValue() === EventType.RUBRIK) this._termine.total.next(events.length)

      return events
    } catch (err) {
      return []
    }
  }

}

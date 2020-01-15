import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '@other/interfaces';
import memo from 'memo-decorator';

@Pipe({
  name: 'mobileSort'
})
export class MobileSortPipe implements PipeTransform {

  @memo()
  transform(events: Event[]): Event[] {
    let events_to_return = []
    // Push Kino Events
    events_to_return = events_to_return.concat(events.filter(event => event.rubrik === 'Kino'))
    // Push Partys Events
    events_to_return = events_to_return.concat(events.filter(event => event.rubrik === 'Partys'))
    // Push Bühne Events
    events_to_return = events_to_return.concat(events.filter(event => event.rubrik === 'Bühne'))
    // Push Musik Events
    events_to_return = events_to_return.concat(events.filter(event => event.rubrik === 'Musik'))
    // Push the rest of the events in alphabetical order of title
    events_to_return = events_to_return.concat(events.filter(event => {
      switch ( event.rubrik ) {
        case 'Kino':
        case 'Partys':
        case 'Bühne':
        case 'Musik':
          return false
        default:
          return true
      }
    }).sort(this.alphabetical))
    return events_to_return
  }

  alphabetical(a: Event, b: Event) {
    var textA = a.titel.toUpperCase()
    var textB = b.titel.toUpperCase()
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
  }

}

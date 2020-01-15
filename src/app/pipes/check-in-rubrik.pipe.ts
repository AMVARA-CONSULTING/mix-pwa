import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '@other/interfaces';
import memo from 'memo-decorator';

@Pipe({
  name: 'checkInRubrik'
})
export class CheckInRubrikPipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(events: Event[], rubrik: string, filter: string): Event[] {
    switch (filter) {
      case 'titel':
        return events.filter(event => event.titel == rubrik)
      case 'adressname':
        return events.filter(event => {
          // I'm not 100% sure where to find the constant location, so I try with 4 fields
          const location = event.verort || event.adressname || event.missing_verort || event.or_verort
          return rubrik == location
        })
    }
  }

}

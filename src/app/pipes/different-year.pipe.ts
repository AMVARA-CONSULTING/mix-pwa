import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs'

@Pipe({
  name: 'differentYear'
})
export class DifferentYearPipe implements PipeTransform {

  transform(datum: string): string {
    const currentYear = dayjs().year()
    const datumYear = dayjs(datum, 'YYYY-MM-DD').year()
    return currentYear == datumYear ? '' : `${datumYear}`
  }

}

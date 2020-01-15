import { Pipe, PipeTransform } from '@angular/core';
import { sortByMonth } from '@services/tools.service';

@Pipe({
  name: 'monatListSort'
})
export class MonatListSortPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\s+/g, '').split(',').sort(sortByMonth).join(', ')
  }

}

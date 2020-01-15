import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'printDate'
})
export class PrintDatePipe implements PipeTransform {

  @memo()
  transform(name: string): string {
    return name ? name.split('_').join(' / ') : ''
  }

}

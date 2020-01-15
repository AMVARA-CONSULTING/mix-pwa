import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'termineFinalPrice'
})
export class TermineFinalPricePipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(text: string, final_price: number): string {
    return text.replace('[price]', final_price.toString())
  }

}

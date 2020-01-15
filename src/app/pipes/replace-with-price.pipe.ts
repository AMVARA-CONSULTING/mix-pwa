import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'replaceWithPrice'
})
export class ReplaceWithPricePipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(text: string, price: number): string {
    return text.replace('[price]', price.toString())
  }

}

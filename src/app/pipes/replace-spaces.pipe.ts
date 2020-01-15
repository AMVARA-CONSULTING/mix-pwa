import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'replaceSpaces'
})
export class ReplaceSpacesPipe implements PipeTransform {

  @memo()
  transform(value: string): string {
    return value.replace(/\s+/g, '_')
  }

}

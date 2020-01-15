import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'detailBuchSpaces'
})
export class DetailBuchSpacesPipe implements PipeTransform {

  @memo()
  transform(text: string): string {
    return text.replace(/\,/g, ', ')
  }

}

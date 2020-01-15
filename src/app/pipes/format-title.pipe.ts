import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator'

@Pipe({
  name: 'formatTitle'
})
export class FormatTitlePipe implements PipeTransform {

  @memo()
  transform(title: string): string {
    if (title) {
      // Formatting should be done in backend
      // title=title.replace(/\"/g, "")
      // if (title[title.length-1]=='.'){
      //   title= title.substring(0, title.length - 1);
      // }
      return title
    }
  }

}

import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator'

@Pipe({
  name: 'cutText'
})
export class CutTextPipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(text: string, num: number): string {
    if (text){
      if (text.length>num){
        return text.slice(0,num)+'...';
      }
      else{
        return text
      }
    } else {
      return "";
    }
  }

}

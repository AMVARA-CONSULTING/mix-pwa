import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator';

@Pipe({
  name: 'replacePayCalc'
})
export class ReplacePayCalcPipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(text: string, title: string, kurze: string, hour: string): string {
    const matches = {
      "_title_": title,
      "_kurze_": kurze,
      "_hour_": hour
    }
    var re = new RegExp(Object.keys(matches).join("|"),"gi")
    return text.replace(re, function(matched){
      return matches[matched]
    })
  }

}

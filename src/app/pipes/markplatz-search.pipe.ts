import { Pipe, PipeTransform } from '@angular/core';
import memo from 'memo-decorator'

@Pipe({
  name: 'markplatzSearch'
})
export class MarkplatzSearchPipe implements PipeTransform {

  @memo((...args: any[]): string => JSON.stringify(args))
  transform(value: any, search: string): any[] {
    var hit = false
    return value.filter(item => {
      if (item.rubrik === 'banner') return item
      hit = true
      const words = search.split(" ")
      const length = words.length
      let i = 0
      for (; i < length; i++) {
        const aux = item.text.replace(/<span>/g, "")
        const regex = new RegExp(`${words[i]}`, 'gi')
        if (!aux.match(regex)) {
          hit = false
          return
        }
      }
      if (hit) return item
    })
  }

}

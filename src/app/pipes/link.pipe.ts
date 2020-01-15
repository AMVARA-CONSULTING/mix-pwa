import { Pipe, PipeTransform } from '@angular/core';

declare const anchorme: any

@Pipe({
  name: 'link'
})
export class LinkPipe implements PipeTransform {

  transform(text: string): any {
    return anchorme(text, {
      attributes: [
        function(urlObj){
          if(urlObj.reason !== "email") return {
            name: 'target',
            value: '_blank'
          };
        },
      ]
    })
  }

}

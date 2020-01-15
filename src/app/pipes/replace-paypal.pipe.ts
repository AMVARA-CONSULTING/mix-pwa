import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replacePaypal'
})
export class ReplacePaypalPipe implements PipeTransform {

  transform(html: string, url: string): string {
    return html.replace('<go-paypal>', `<a href="${url}" target="_blank">`).replace('</go-paypal>', '</a>');
  }

}

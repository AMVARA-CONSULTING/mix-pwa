import { Pipe, PipeTransform } from '@angular/core';
import { InfoService } from '@services/info.service';

@Pipe({
  name: 'callNumber'
})
export class CallNumberPipe implements PipeTransform {

  constructor(
    private _info: InfoService
  ) { }

  transform(phone: string): string {
    phone = phone
          .replace(/\s+/, '') // Remove spaces
          .replace(/\D/g, '') // Remove all non numeric characters
          .replace(/^0+/, '') // Remove leading zeros
    phone = `+49${phone}`
    return phone
  }

}

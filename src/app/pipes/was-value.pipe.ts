import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Description: Pipe used to translate multiple rubrik semicolon separated array
 * into a human readable UI, used mainly in Termine top search bar (WAS)
 */

@Pipe({
  name: 'wasValue'
})
export class WasValuePipe implements PipeTransform {

  constructor(
    private _i18n: TranslateService
  ) { }

  transform(rubriks: string[] | string): string {
    if (!Array.isArray(rubriks)) rubriks = rubriks.split(';')
    if (rubriks.length === 1) return rubriks[0]
    if (rubriks.length === 0) return this._i18n.instant('termine.waswannwo.was_egal')
    return `Kategorien (${rubriks.length})`
  }

}

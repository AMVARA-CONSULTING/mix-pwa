import { Pipe, PipeTransform, Host } from '@angular/core';
import { AufgebenTermineComponent } from '@components/aufgeben-termine/aufgeben-termine.component';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'replaceAbsenden'
})
export class ReplaceAbsendenPipe implements PipeTransform {

  constructor(
    @Host() private _aufgeben: AufgebenTermineComponent,
    private _translate: TranslateService
  ) { }

  transform(text: string): any {
    return this._aufgeben.free.pipe(
      switchMap(free => {
        if (free) {
          const translation = this._translate.instant('aufgeben.termine.advertise_normal')
          return of(text.replace('[absenden_text]', `[${translation}]`))
        } else {
          const translation = this._translate.instant('aufgeben.termine.advertise_paypal')
          return of(text.replace('[absenden_text]', `[${translation}]`))
        }
      })
    )
  }

}

import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs/internal/observable/of';

@Pipe({
  name: 'replacePaymentDate'
})
export class ReplacePaymentDatePipe implements PipeTransform {

  transform(text: string, date: BehaviorSubject<string>): Observable<string> {
    return date.pipe(
      switchMap(date => of(text && text.replace('$payment_date$', date)))
    )
  }

}

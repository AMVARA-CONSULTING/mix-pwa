import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Pipe({
  name: 'replaceMandat'
})
export class ReplaceMandatPipe implements PipeTransform {

  transform(text: string, mandat: BehaviorSubject<string>): Observable<string> {
    return mandat.pipe(
      switchMap(mandat => of(text.replace('$mandat$', mandat)))
    )
  }

}

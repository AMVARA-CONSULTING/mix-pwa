import { Pipe, PipeTransform, OnDestroy, Host } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { AufgebenTermineComponent } from '@components/aufgeben-termine/aufgeben-termine.component';

@Pipe({
  name: 'replaceDate'
})
export class ReplaceDatePipe implements PipeTransform, OnDestroy {

  constructor(
    @Host() private _aufgeben: AufgebenTermineComponent
  ) { }

  subscriptionManager: Subscription

  transform(text: string): Observable<string> {
    return new Observable(observer => {
      this.subscriptionManager = this._aufgeben.abbuchung$.subscribe(abb => observer.next(text.replace('[date]', abb)))
    })
  }

  ngOnDestroy() {
    if (this.subscriptionManager) this.subscriptionManager.unsubscribe()
  }

}

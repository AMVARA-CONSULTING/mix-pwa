import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs/internal/Observable';

@Pipe({
  name: 'terminePayCalculation'
})
export class TerminePayCalculationPipe implements PipeTransform, OnDestroy {

  subscriptionManager: Subscription

  transform(title: string, kurze: string, date_array: Observable<any[]>): Observable<string> {
    return new Observable(observer => {
      this.subscriptionManager = date_array.subscribe(dates => {
        const t_zeichen = title.length + 8 + kurze.length
        const t_zeilen  = Math.ceil( t_zeichen / 82 )
        const t_anztage = dates.length
        const t_summe   = t_anztage * 5 * (t_zeilen)
        const t_betrag  = `${t_zeilen} Abrechnungseinheit(en) x 5 Euro x ${t_anztage} Tag(e) = ${t_summe},- Euro Brutto`
        observer.next(t_betrag)
      })
    })
  }

  ngOnDestroy() {
    if (this.subscriptionManager) this.subscriptionManager.unsubscribe()
  }

}

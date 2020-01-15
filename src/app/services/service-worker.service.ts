import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { first } from 'rxjs/internal/operators/first';
import { interval } from 'rxjs/internal/observable/interval';
import { concat } from 'rxjs/internal/observable/concat';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {

  constructor( appRef: ApplicationRef, updates: SwUpdate, private _snack: MatSnackBar) {
    (window as any).sw = updates
    console.log("SW Service Running")
    if (updates.isEnabled) {
      console.log("SW Service is enabled")
      updates.available.subscribe(event => {
        console.log("SW Update Available")
        updates.activateUpdate().then(() => document.location.reload(true))
      });
      // Allow the app to stabilize first, before starting polling for updates with `interval()`.
      const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true))
      const everyHour$ = interval(60 * 60 * 1000)
      appIsStable$.subscribe(_ => {
        console.log("App Stabilized")
      })
      const everyHourOnceAppIsStable$ = concat(appIsStable$, everyHour$)

      everyHourOnceAppIsStable$.subscribe(() => {
        updates.checkForUpdate().then(() => {
          console.log('Checking for updates...');
        }).catch((err) => {
          console.error('Error when checking for update', err);
        });
      })
    }
  }
}

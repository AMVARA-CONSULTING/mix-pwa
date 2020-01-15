import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { catchError } from "rxjs/internal/operators/catchError";
import { throwError } from "rxjs/internal/observable/throwError";
import { MatDialog } from "@angular/material/dialog";
import { ErrorDialog } from "@dialogs/error/error.dialog";
import * as Sentry from '@sentry/browser';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
      private _dialog: MatDialog
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log(err);
        // Check for status errors, invalid JSON, etc
        this._dialog.open(ErrorDialog, { data: err })
        Sentry.captureException(err);
        return throwError(err)
      })
    )
  }
}
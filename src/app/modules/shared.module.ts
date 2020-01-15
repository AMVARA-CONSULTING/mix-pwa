import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadedImageComponent } from '@components/uploaded-image/uploaded-image.component';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadedTextComponent } from '@components/uploaded-text/uploaded-text.component';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';
import { KazEmailFormComponent } from '@components/kaz-email-form/kaz-email-form.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BannerWrapperComponent } from '@components/ui/banner-wrapper/banner-wrapper.component';
import { BannerComponent } from '@components/ui/banner/banner.component';
import { ExcludeTabletMiddleBannerPipe } from '@pipes/exclude-tablet-middle-banner.pipe';
import { InsertMarktplatzBannersPipe } from '@pipes/insert-marktplatz-banners.pipe';
import { MarkplatzSearchPipe } from '@pipes/markplatz-search.pipe';
import { NotFoundComponent } from '@components/ui/not-found/not-found.component';
import { MatRippleModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LoaderComponent } from '@components/ui/loader/loader.component';
import { InstallMessengerDialog } from '@dialogs/install-messenger/install-messenger.dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ErrorDialog } from '@dialogs/error/error.dialog';
import { ReplacePaypalPipe } from '@pipes/replace-paypal.pipe';
import { MonatListSortPipe } from '@pipes/monat-list-sort.pipe';
import { MatMomentDateModule, MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
  }

@NgModule({
  imports: [
      MatProgressSpinnerModule,
      TranslateModule.forChild({
          loader: {
              provide: TranslateLoader,
              useFactory: (createTranslateLoader),
              deps: [HttpClient]
          }
      }),
      CommonModule,
      MatTooltipModule,
      MatProgressSpinnerModule,
      NgxCaptchaModule,
      FormsModule,
      ReactiveFormsModule,
      MatRippleModule,
      MatDialogModule,
      MatButtonModule,
      MatDatepickerModule,
      MatMomentDateModule,
      MatCheckboxModule
  ],
  declarations: [
      UploadedImageComponent,
      UploadedTextComponent,
      SafeHtmlPipe,
      ReplacePaypalPipe,
      KazEmailFormComponent,
      BannerWrapperComponent,
      BannerComponent,
      ExcludeTabletMiddleBannerPipe,
      InsertMarktplatzBannersPipe,
      MarkplatzSearchPipe,
      NotFoundComponent,
      LoaderComponent,
      InstallMessengerDialog,
      ErrorDialog,
      MonatListSortPipe
  ],
  entryComponents: [
    InstallMessengerDialog,
    ErrorDialog
  ],
  providers: [
    MomentDateAdapter,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'de' }
  ],
  exports: [
    MatMomentDateModule,
    NgxCaptchaModule,
    MatRippleModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MonatListSortPipe,
    MatDatepickerModule,
    UploadedImageComponent,
    UploadedTextComponent,
    CommonModule,
    MatTooltipModule,
    SafeHtmlPipe,
    MatProgressSpinnerModule,
    KazEmailFormComponent,
    ReplacePaypalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    BannerWrapperComponent,
    BannerComponent,
    ExcludeTabletMiddleBannerPipe,
    InsertMarktplatzBannersPipe,
    MarkplatzSearchPipe,
    NotFoundComponent,
    LoaderComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        MomentDateAdapter
      ]
    };
  }
}

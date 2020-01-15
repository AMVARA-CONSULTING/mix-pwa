/* Angular */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injectable, ErrorHandler } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

/* Angular Material */

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutModule } from '@angular/cdk/layout';

/* Components / Views */

import { AppComponent } from '@components/main/app.component';
import { HeaderComponent } from '@components/header/header.component';
import { TermineComponent } from '@components/termine/termine.component';
import { FooterComponent } from '@components/footer/footer.component';
import { EditorComponent } from '@components/editor/editor.component';
import { MixLoginComponent } from '@components/mix-login/mix-login.component';
import { MerklisteComponent } from '@components/merkliste/merkliste.component';
import { UserSettingsComponent } from '@components/user-settings/user-settings.component';
import { CookiesComponent } from '@components/cookies/cookies.component';
import { TermineDetailComponent } from '@components/termine-detail/termine-detail.component';
import { CarouselComponent } from '@components/carousel/carousel.component';
import { TooMuchItemsComponent } from '@components/ui/too-much-items/too-much-items.component';
import { EasterEggComponent } from '@components/ui/easter-egg/easter-egg.component';

/* Pipes */

import { FormatTitlePipe } from '@pipes/format-title.pipe';
import { CheckDatumPipe } from '@pipes/check-datum.pipe';
import { CutTextPipe } from '@pipes/cut-text.pipe';
import { SlicerPipe } from '@pipes/slicer.pipe';
import { ToThumbnailBackgroundImagePipe } from '@pipes/to-thumbnail-background-image.pipe';
import { DetailBuchSpacesPipe } from '@pipes/detail-buch-spaces.pipe';
import { WannValuePipe } from '@pipes/wann-value.pipe';
import { MobileSortPipe } from '@pipes/mobile-sort.pipe';
import { ToTermineBackgroundImagePipe } from '@pipes/to-termine-background-image.pipe';
import { CheckInRubrikPipe } from '@pipes/check-in-rubrik.pipe';
import { InsertBannersPipe } from '@pipes/insert-banners.pipe';
import { MapRubrikSortingPipe } from '@pipes/map-rubrik-sorting.pipe';
import { ReduceByTitelPipe } from '@pipes/reduce-by-titel.pipe';
import { SortDateHoursPipe } from '@pipes/sort-date-hours.pipe';
import { ReplaceSpacesPipe } from '@pipes/replace-spaces.pipe';
import { SortByTimePipe } from '@pipes/sort-by-time.pipe';
import { CallNumberPipe } from '@pipes/call-number.pipe';
import { LinkPipe } from './pipes/link.pipe';

/* Services */

import { ApiService } from '@services/api.service';
import { GlobalsService } from '@services/globals.service';
import { UserService } from '@services/user.service';
import { ToolsService, getApiUrl, safeGetStorageItem } from '@services/tools.service';
import { InfoService } from '@services/info.service';

/* Dialogs */

import { ChangePasswordDialog } from '@dialogs/change-password/change-password.dialog';
import { ChangeEmailDialog } from '@dialogs/change-email/change-email.dialog';
import { ShareDialog } from '@dialogs/share/share.dialog';
import { FullscreenDialog } from '@dialogs/fullscreen/fullscreen.dialog';
import { AttendDialog } from '@dialogs/attend/attend.dialog';
import { KinoDatesDialog } from '@dialogs/kino-dates/kino-dates.dialog';
import { KinoPlaceDialog } from '@dialogs/kino-place/kino-place.dialog';
import { FeedbackPromptDialog } from '@dialogs/feedback-prompt/feedback-prompt.dialog';
import { FeedbackDialog } from '@dialogs/feedback/feedback.dialog';
import { TermineDetailFlagDialog } from '@dialogs/termine-detail-flag/termine-detail-flag.dialog';

/* Guards */

/* Modules */

import { SharedModule } from '@modules/shared.module';
import { KazenModule } from '@modules/kazen.module';

/* Directives */

import { OnlyNumbers } from '@directives/only-numbers.directive';

/* 3rd parties plugins */

import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { OwlModule } from 'ngx-owl-carousel';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { API_URL } from './tokens';
import * as Sentry from "@sentry/browser";
import { ErrorInterceptor } from '@services/http.interceptor';
import { AppInstallPromptComponent } from './components/app-install-prompt/app-install-prompt.component';
import { DifferentYearPipe } from './pipes/different-year.pipe';
import { SatDatepickerModule, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from 'saturn-datepicker';
import { WasValuePipe } from './pipes/was-value.pipe';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { SocialPermission } from '@dialogs/social-permission/social-permission';
import { EventProvidersDialog } from '@dialogs/event-providers/event-providers.dialog';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@environments/environment';

Sentry.init({
  // @ts-ignore
  dsn: "https://12345678912345678912345678912345@test.test.te/3",
  debug: false
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    const moduleFailedMessage = /Failed to load module script/;
    if (chunkFailedMessage.test(error.message) || moduleFailedMessage.test(error.message)) {
      window.location.reload();
    }
    try {
      Sentry.captureException(error.originalError || error);
    } catch (err) { }
    // Sentry.showReportDialog({ eventId });
  }
}

export function isMac() {
  return /Mac/.test(navigator.userAgent) && !(window as any).MSStream
}

const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/termine/main'
  },
  {
    path: 'termine',
    redirectTo: 'termine/main'
  },
  {
    path: 'termine/:id', component: TermineComponent, data: { searchIcon: false }
  },
  {
    path: 'termine/:id/image', component: TermineComponent, data: { searchIcon: false }
  },
  {
    path: 'kontakte',
    loadChildren: () => import('@modules/kontakte.module').then(m => m.KontakteModule),
    data: { searchIcon: true }
  },
  {
    path: 'marktplatz',
    loadChildren: () => import('@modules/marktplatz.module').then(m => m.MarktplatzModule),
    data: { searchIcon: true }
  },
  {
    path: 'aufgeben',
    loadChildren: () => import('@modules/aufgeben.module').then(m => m.AufgebenModule),
    data: { searchIcon: false }
  },
  {
    path: 'impressum',
    loadChildren: () => import('@modules/impressum.module').then(m => m.ImpressumModule),
    data: { searchIcon: false }
  },
  {
    path: 'datenschutz',
    loadChildren: () => import('@modules/datenschutz.module').then(m => m.DatenschutzModule),
    data: { searchIcon: false }
  },
  {
    path: 'mediadaten',
    loadChildren: () => import('@modules/mediadaten.module').then(m => m.MediadatenModule),
    data: { searchIcon: false }
  },
  {
    path: 'print',
    loadChildren: () => import('@modules/print.module').then(m => m.PrintModule),
    data: { searchIcon: false }
  },
  {
    path: '**',
    redirectTo: '/termine/main'
  }
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

let socialProviders = [];

if(safeGetStorageItem("session_origin") == "google"){
  socialProviders.push({id: GoogleLoginProvider.PROVIDER_ID,provider: new GoogleLoginProvider('123456789123-12abc3de4f5g6h7ij8klmnopqrs91tv2.apps.googleusercontent.com', {
  })});
}else if(safeGetStorageItem("session_origin") == "facebook"){
  socialProviders.push({id: FacebookLoginProvider.PROVIDER_ID,provider: new FacebookLoginProvider('123456789123456', {}, 'de_DE')}); 
}
const config = new AuthServiceConfig(socialProviders)

export function provideConfig() {
  return config;
}

export function getGenericInfo(_info: InfoService) {
  return () => _info.getGenericServerInfo()
}

export function isEdge() {
  return window.navigator.userAgent.indexOf("Edge") > -1
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TermineComponent,
    FooterComponent,
    EditorComponent,
    TermineDetailComponent,
    MixLoginComponent,
    MerklisteComponent,
    UserSettingsComponent,
    CookiesComponent,
    CarouselComponent,
    FormatTitlePipe,
    CheckDatumPipe,
    CutTextPipe,
    OnlyNumbers,
    SlicerPipe,
    TooMuchItemsComponent,
    /* Dialogs */
    ChangePasswordDialog,
    ChangeEmailDialog,
    ShareDialog,
    FeedbackDialog,
    FullscreenDialog,
    FeedbackPromptDialog,
    ToThumbnailBackgroundImagePipe,
    DetailBuchSpacesPipe,
    AttendDialog,
    WannValuePipe,
    MobileSortPipe,
    ToTermineBackgroundImagePipe,
    CheckInRubrikPipe,
    InsertBannersPipe,
    MapRubrikSortingPipe,
    ReduceByTitelPipe,
    EasterEggComponent,
    KinoDatesDialog,
    KinoPlaceDialog,
    SortDateHoursPipe,
    ReplaceSpacesPipe,
    TermineDetailFlagDialog,
    EventProvidersDialog,
    CallNumberPipe,
    SortByTimePipe,
    LinkPipe,
    AppInstallPromptComponent,
    DifferentYearPipe,
    WasValuePipe,
    SocialPermission
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    OwlModule,
    SatDatepickerModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production && !isEdge() }),
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    SharedModule.forRoot(),
    KazenModule,
    LayoutModule,
    SocialLoginModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    RouterModule.forRoot(appRoutes, {
      paramsInheritanceStrategy: 'always', // Inherit parent route parameters from parents to child components
      useHash: true, // Routes starts with /#/
      preloadingStrategy: PreloadAllModules // Preload extra modules once the App has been fully loaded
    })
  ],
  providers: [
    {
      provide: API_URL,
      useValue: `${getApiUrl()}` // From tools.service.ts
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    { provide: AuthServiceConfig, useFactory: provideConfig }, // 3rd party Authentication
    { provide: APP_INITIALIZER, useFactory: getGenericInfo, deps: [InfoService, ToolsService], multi: true }, // Get server info before the App starts
    MomentDateAdapter,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'de' },
    ApiService,
    GlobalsService,
    UserService,
    InfoService,
    ErrorInterceptor
  ],
  entryComponents: [
    ChangePasswordDialog,
    ChangeEmailDialog,
    ShareDialog,
    TermineDetailComponent,
    FeedbackDialog,
    FullscreenDialog,
    AttendDialog,
    FeedbackPromptDialog,
    KinoDatesDialog,
    KinoPlaceDialog,
    TermineDetailFlagDialog,
    SocialPermission,
    EventProvidersDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { safeSetStorageItem, safeClearStorage } from '@services/tools.service';

@Component({
  selector: 'mix-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookiesComponent {

  constructor(
    public translate: TranslateService,
    public globals: GlobalsService
  ) { }

  agree(){
    this.globals.localStorage=true;
    safeSetStorageItem("cookies", "agree");
    this.globals.cookiesObserver.next(true)
  }
  disagree(){
    safeClearStorage();
    this.globals.localStorage=false;
    this.globals.cookiesObserver.next(false)
    this.globals.cookiesObserver.next(true)
  }
}

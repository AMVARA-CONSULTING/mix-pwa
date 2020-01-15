import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { InfoService } from '@services/info.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-aufgeben-menu',
  templateUrl: './aufgeben-menu.component.html',
  styleUrls: ['./aufgeben-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AufgebenMenuComponent implements OnInit {

  constructor(
    private _info: InfoService,
    private _translate: TranslateService
  ) {
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this._translate.use('de')
  }

  ngOnInit() {
    this._info.getGenericServerInfo()
  }

}

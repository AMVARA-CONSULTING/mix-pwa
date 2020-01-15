import { Component, OnInit } from '@angular/core';
import { safeGetStorageItem, safeSetStorageItem } from '@services/tools.service';

@Component({
  selector: 'mix-app-install-prompt',
  templateUrl: './app-install-prompt.component.html',
  styleUrls: ['./app-install-prompt.component.scss']
})
export class AppInstallPromptComponent implements OnInit {

  ngOnInit() {
    let ios_app_install_counter = safeGetStorageItem('ios_app_install_counter', true)
    let ios_app_install_counter_number = 0
    if (ios_app_install_counter != null) {
      ios_app_install_counter_number = parseInt(ios_app_install_counter)
    }
    ios_app_install_counter_number++
    safeSetStorageItem('ios_app_install_counter', ios_app_install_counter_number.toString(), true)
  }

}

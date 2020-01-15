import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: 'mix-install-messenger',
  templateUrl: 'install-messenger.dialog.html',
  styleUrls: ['./install-messenger.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstallMessengerDialog { 
  open_download(){
    window.open("https://www.messenger.com/")
  }
}
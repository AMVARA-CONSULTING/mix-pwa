import { Component, ChangeDetectionStrategy, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Print } from "@other/interfaces";
import { ToolsService } from "@services/tools.service";
import { API_URL } from "app/tokens";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { DomSanitizer } from "@angular/platform-browser";

declare const dayjs: any

@Component({
  selector: 'mix-prints',
  templateUrl: 'prints.dialog.html',
  styleUrls: ['./prints.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrintsDialog {

  constructor(
    public dialogRef: MatDialogRef<PrintsDialog>,
    private _tools: ToolsService,
    private _sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: Print[]
  ) {
    this.prints = data.filter(print => this.checkCompatiblePrint(print.name))
  }

  getLink(name) {
    return this._sanitizer.bypassSecurityTrustUrl(`http://${location.hostname}/v1/data/print_mix/${name}/index.html`)
  }

  prints: Print[] = []

  checkCompatiblePrint(date) {
    const limitDate = dayjs('2017-01')
    const currentDate = dayjs(date, 'YYYY_MM')
    if (limitDate.diff(currentDate, 'days') > 0) {
      if (this._tools.isMobile()) {
        return this._tools.isIOS() 
      }
    }
    return true
  }

  myColor = 'rgba(255,255,255,.05)'
  
}
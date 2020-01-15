import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { InfoService } from "@services/info.service";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { ApiService } from "@services/api.service";

@Component({
  selector: 'mix-termine-detail-flag',
  templateUrl: 'termine-detail-flag.dialog.html',
  styleUrls: ['./termine-detail-flag.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermineDetailFlagDialog implements OnInit {

  loading = new BehaviorSubject<boolean>(true)
  info_box_text = new BehaviorSubject<string>('')

  constructor(
    public dialogRef: MatDialogRef<TermineDetailFlagDialog>,
    public _info: InfoService,
    private _api: ApiService
  ) {
    this.info_box_text.next(this._info.serverInfo.info_box)
  }

  ngOnInit() {
    this._api.getSimpleInfo().subscribe(info => {
      this.info_box_text.next(info.info_box)
      this.loading.next(false)
    })
  }

}
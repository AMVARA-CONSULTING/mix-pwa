import { Component, ChangeDetectionStrategy, Inject, OnInit, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UserService } from "@services/user.service";
import { ApiService } from "@services/api.service";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { SubSink } from "@services/tools.service";

@Component({
  selector: 'mix-attend',
  templateUrl: 'attend.dialog.html',
  styleUrls: ['./attend.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendDialog implements OnInit, OnDestroy {

  _subs = new SubSink()

  ngOnDestroy() {
    this._subs.unsubscribe()
  }

  constructor(
    public dialogRef: MatDialogRef<AttendDialog>,
    public _user: UserService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Check if the event is already on attend list
    this.checkAttended()
    this.updateList()
  }

  updateList() {
    const form = new FormData()
    form.append("id", this._user.id)
    form.append("token", this._user.token)
    if (this._user.social) {
      form.append('authToken', this._user.social['authToken'])
      form.append('idToken', this._user.social['idToken'])
      form.append("origin", this._user.social['provider'])
      this.provider.next(this._user.social['provider'])
    } else {
      form.append("origin", 'mix')
      this.provider.next('mix')
    }
    form.append('eventid', this.data.eventid.toString())
    form.append('mode', 'list')
    form.append('add', 'false')
    this._subs.sink = this._api.sendAssistance(form).subscribe(data => this.assistants.next(data.users || []) )
  }

  
  checkAttended() {
    const form = new FormData()
    form.append("id", this._user.id)
    form.append("token", this._user.token)
    if (this._user.social) {
      form.append('authToken', this._user.social['authToken'])
      form.append('idToken', this._user.social['idToken'])
      form.append("origin", this._user.social['provider'])
      this.provider.next(this._user.social['provider'])
    } else {
      form.append("origin", 'mix')
    }
    form.append('eventid', this.data.eventid.toString())
    form.append('mode', 'check')
    form.append('add', 'false')
    this._subs.sink =  this._api.sendAssistance(form).subscribe(data => {
      this.attended.next(data.response === '1')
      this.attendDisabled.next(false)
    })
  }

  attend(set: boolean): void {
    const form = new FormData()
    form.append("id", this._user.id)
    form.append("token", this._user.token)
    if (this._user.social) {
      form.append('authToken', this._user.social['authToken'])
      form.append('idToken', this._user.social['idToken'])
      form.append("origin", this._user.social['provider'])
      this.provider.next(this._user.social['provider'])
    } else {
      form.append("origin", 'mix')
    }
    form.append('eventid', this.data.eventid.toString())
    form.append('mode', 'set')
    form.append('add', set.toString())
    this._subs.sink = this._api.sendAssistance(form).subscribe(data => {
      this.attended.next(data.response === 'assistance saved')
      this.updateList()
    })
  }

  attended = new BehaviorSubject<boolean>(false)

  attendDisabled = new BehaviorSubject<boolean>(true)

  provider = new BehaviorSubject<string>('')

  assistants = new BehaviorSubject<any[]>([])

}
import { Component, ChangeDetectionStrategy, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "@services/user.service";
import { ApiService } from "@services/api.service";
import { ToolsService } from "@services/tools.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Component({
  selector: 'mix-change-password',
  templateUrl: 'change-password.dialog.html',
  styleUrls: ['./change-password.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordDialog {

  pForm: FormGroup

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialog>,
    private _translate: TranslateService,
    private _user: UserService,
    private _api: ApiService,
    private _tools: ToolsService,
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.pForm = _fb.group({
        old_password: ['', Validators.required],
        new_password: ['', Validators.required],
        confirm_password: ['', Validators.required]
      })
    }

  hint = new BehaviorSubject<string>('')

  sending = new BehaviorSubject<boolean>(false)
  
  checkForm(){
    const old_password: string = this.pForm.get('old_password').value
    const new_password: string = this.pForm.get('new_password').value
    const confirm_password: string = this.pForm.get('confirm_password').value
    if (old_password==""){
      this.hint.next(this._translate.instant("user_errors.no_password"))
      return
    } 
    if (confirm_password==""){
      this.hint.next(this._translate.instant("user_errors.no_repeat_password"))
      return
    }
    if (new_password==""){
      this.hint.next(this._translate.instant("user_errors.no_password"))
      return
    }
    var strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
    if (!strongPassword.test(confirm_password)) {
      this.hint.next(this._translate.instant("user_errors.low_password_security"))
      return
    }
    if (new_password === confirm_password) {
      var form = new FormData;
      form.append("id",this._user.id)
      form.append("token",this._user.token)
      if (this._user.social!=null){
        form.append('authToken',this._user.social['authToken'])
        form.append('idToken',this._user.social['idToken'])
        form.append('idToken',this._user.social['idToken'])
        form.append("origin",this._user.social ['provider'])
      } 
      else{
        form.append("origin",'mix')
      }
      form.append("old_password",old_password)
      form.append("new_password",confirm_password)
      this.sending.next(true)
      this._api.changePassword(form).subscribe(
        data => {
          var response = data;
          if (response['response']=='invalid') {
            this.hint.next(this._translate.instant("user_errors.invalid_password"))
          }
          if (response['response']=='valid') {
            this.dialogRef.close()
          }
          if (response['response'].startsWith("EX")==true){
            this.hint.next(this._translate.instant("user_errors.general_error"))
            this._user.signOut()
          }
        }, err => {

        }, () => {
          this.sending.next(false)
        }
      )
    }
    else{
      this._tools.alert(this._translate.instant("user_errors.error_title"), this._translate.instant("user_errors.password_not_match"), 'Ok', 'Cancel')
    }
  }

}
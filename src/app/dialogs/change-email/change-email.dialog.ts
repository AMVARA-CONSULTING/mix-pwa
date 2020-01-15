import { Component, ChangeDetectionStrategy, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "@services/user.service";
import { ApiService } from "@services/api.service";
import { ToolsService } from "@services/tools.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

@Component({
  selector: 'mix-change-email',
  templateUrl: 'change-email.dialog.html',
  styleUrls: ['./change-email.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangeEmailDialog {

  pForm: FormGroup

  constructor(
    public dialogRef: MatDialogRef<ChangeEmailDialog>,
    private _translate: TranslateService,
    private _user: UserService,
    private _api: ApiService,
    private _tools: ToolsService,
    private _fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.pForm = this._fb.group({
        password: ['', Validators.required],
        email: ['', Validators.required]
      })
    }

  hint = new BehaviorSubject<string>('')

  sending = new BehaviorSubject<boolean>(false)
  
  checkForm(){
    const password: string = this.pForm.get('password').value
    const email: string = this.pForm.get('email').value
    if (password==""){
      this.hint.next(this._translate.instant("user_errors.no_password"))
      return
    }
    if (email== "") {
      this.hint.next(this._translate.instant("user_errors.no_email"))
      return
    }
    if (!this._tools.validmail(email)) {
      this.hint.next(this._translate.instant("aufgeben.kazen.chiffre_format"))
      return
    }
    const form = new FormData
    form.append("id",this._user.id)
    form.append("token",this._user.token)
    if (this._user.social!=null){
      form.append('authToken',this._user.social['authToken'])
      form.append('idToken',this._user.social['idToken'])
      form.append('idToken',this._user.social['idToken'])
      form.append("origin",this._user.social ['provider'])
    } else {
      form.append("origin",'mix')
    }
    form.append("password", password)
    form.append("email", email)
    this._api.changeEmail(form).subscribe(
      data => {var response = data;
        if (response['response']=='taken') this.hint.next(this._translate.instant("user_errors.email_taken"))
        if (response['response']=='invalid') this.hint.next(this._translate.instant("user_errors.invalid_password"))
        if (response['response']=='valid') {
          if (this._user.social!= null) this._user.sendSocial()
          else this._user.sendLocalMix();
          this.dialogRef.close()
        }
        if (response['response']=='email_error') this.hint.next(this._translate.instant("user_errors.invalid_email"))
        if (response['response'].startsWith("EX")==true){
          this.hint.next(this._translate.instant("user_errors.general_error"))
          this._user.signOut();
        }
      }
    );
  }

}
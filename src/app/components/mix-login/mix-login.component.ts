import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { AuthService } from "angularx-social-login";
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { ToolsService, safeSetStorageItem, safeGetStorageItem, SubSink } from '@services/tools.service';
import { LinkedInLoginProvider } from "angularx-social-login";
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MatDialog } from '@angular/material/dialog';
import { SocialPermission, LoginProvider } from '@dialogs/social-permission/social-permission';

@Component({
  selector: 'mix-login',
  templateUrl: './mix-login.component.html',
  styleUrls: ['./mix-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MixLoginComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  mix_login = false
  mix_login_form = true
  mix_register_form = false
  mix_forgot_form = false
  mix_forgot_digit_form = false
  mix_forgot_pass_form = false
  animation = false
  
  constructor(
    public translate: TranslateService,
    public globals:GlobalsService,
    private authService: AuthService,
    private api:ApiService,
    private user: UserService,
    private _tools: ToolsService,
    private _dialog: MatDialog
  ) { }

  terms_signup = new FormControl(false)

  ngOnInit() {
    this.globals.changeBody(true)
   setTimeout(() => {
     this.animation = !this.animation
   }, 200)
    setTimeout(() => {
      this.globals.changeBody(true)
    }, 100)
  }
  ngOnDestroy(){
    this._subs.unsubscribe()
    this.globals.changeBody(false)
  }

  loadingGoogle = new BehaviorSubject<boolean>(false)
  loadingFacebook = new BehaviorSubject<boolean>(false)

  signInWithGoogle(): void {
    this._dialog.open(SocialPermission, {
      data: LoginProvider.GOOGLE,
      panelClass: 'social-permission-panel',
      width: '400px'
    })
  }
  
  signInWithFB(): void {
    this._dialog.open(SocialPermission, {
      data: LoginProvider.FACEBOOK,
      panelClass: 'social-permission-panel',
      width: '400px'
    })
  }
  
  signInWithLinkedIn(): void {
    this.authService.signIn(LinkedInLoginProvider.PROVIDER_ID);
  }

  name = new FormControl('')

  logInMix(){
    var name=(document.getElementById("name") as HTMLInputElement).value
    var password=(document.getElementById("pass") as HTMLInputElement).value
    var login = new FormData()
    login.append('name',name)
    login.append('password',password)
    login.append('origin','mix')
    this.api.logInWithMix(login).subscribe( data => {
      if (data["response"] != null){
        if (!data["response"].startsWith("EX-")){
          this.user.checkLoginMix(data);
          (document.getElementById("pass") as HTMLInputElement).value = '';
        } else{
          this.showAlert(this.translate.instant("user_errors.sorry"),this.translate.instant("user_errors.user_pass_invalid"));
          (document.getElementById("pass") as HTMLInputElement).value = ''
        }
      } else{
        this.showAlert(this.translate.instant("user_errors.sorry"),this.translate.instant("user_errors.general_error"))
      }
    })
  }
  checkLogienMix(response){
    if(response["response"]=='ok'){
      if (this.globals.localStorage==true){
        safeSetStorageItem('session_token', response['token']);
        safeSetStorageItem("id", response['id']);
      }
      this.user.logged_in=true;
      this.user.loggedIn.next(true)
      this.user.setInfo(response['name'])
    }
  }

  scrollToMix(mode){
    if (this.mix_login==true){
      if (mode=='reference'){
        setTimeout(() => {
          var reference = document.querySelector(".reference");
          reference.scrollIntoView({block: "start", behavior:"smooth"});
        }, 400);
      } else {
        setTimeout(() => {
          var reference = document.getElementById(mode);
          reference.scrollIntoView({block: "start", behavior:"smooth"});
        }, 100);
      }
    }
  }
   
  error_message = ""
  createMix() {
    var name=(document.getElementById("r_name") as HTMLInputElement).value
    var pass=(document.getElementById("r_pass") as HTMLInputElement).value
    var re_pass=(document.getElementById("r_repeat_pass") as HTMLInputElement).value
    var email=(document.getElementById("r_email") as HTMLInputElement).value
    let fields = []
    if (!name) {
      fields.push(this.translate.instant("Nutzername"))
    }
    if (!pass || !re_pass) {
      fields.push(this.translate.instant("Passwort"))
    }
    if (!email) {
      fields.push(this.translate.instant("eMail-Adresse"))
    }
    if (fields.length === 0) {
      fields = []
      if (pass==re_pass) {
        if (pass.length<8){
          fields.push(this.translate.instant("user_errors.short_password"))
        }
        if (!(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/ig.test(re_pass))) {
          fields.push(this.translate.instant("user_errors.low_password_security"))
        }
        if (name.length<3){
          fields.push(this.translate.instant("user_errors.short_user"))
        }
        if (!this._tools.validmail(email)) {
          fields.push(this.translate.instant('aufgeben.kazen.chiffre_format'))
        }
        if (!this.terms_signup.value) {
          fields.push(this.translate.instant('aufgeben.kazen.signup_terms_required'))
        }
        if (fields.length > 0) {
          this.showAlert('MIX für ungut!', fields.join(', '))
          return 
        }
        var form = new FormData()
        form.append('name',name)
        form.append('password',pass)
        form.append('email',email)
        form.append('cookies', (safeGetStorageItem('cookies') === 'agree').toString())
        this._subs.sink = this.api.createAccountMix(form).subscribe( data => {
          if (data['reason']=='invalid user'){
            this.showAlert('MIX für ungut!', this.translate.instant("user_errors.invalid_user"))
            return
          }
          if (data['reason']=='invalid email'){
            this.showAlert('MIX für ungut!', this.translate.instant("user_errors.invalid_email"))
            return
          }
          if ((data['reason']=='long')||(data['reason']=='short')){
            this.showAlert('MIX für ungut!', data['item']+" zu "+data['reason'])
            return
          }
          if (data['reason']=='email'){
            this.showAlert('MIX für ungut!', this.translate.instant("user_errors.email_taken"))
            return
          }
          if (data['reason']=='name'){
            this.showAlert('MIX für ungut!', this.translate.instant("user_errors.user_taken"))
            return
          }
          if (data['reason']=='invalid'){
            this.showAlert('MIX für ungut!', this.translate.instant("user_errors.invalid_email"))
            return
          }
          // this.showAlert(this.translate.instant("user_errors.welcome") ,this.translate.instant("user_errors.new_user_success"))
          this.mix_register_form = false
          this.new_pass = pass
          this.new_name = name
          this.login_new()
          this.created_account = true
          
        })
      } else {
        this.showAlert('MIX für ungut!', this.translate.instant("user_errors.password_not_match"))
      }
    } else {
      this.showAlert('MIX für ungut!', 'Bitte ' + fields.join(', ') + ' eingeben')
    }
  }

  waiting = false
  alert = false
  pre_alert_message = ""
  message_alert = ""
  simple_alert = false
  showAlert(pre_alert, message){
    this.alert=true;
    this.pre_alert_message=pre_alert;
    this.message_alert=message;
    this.waiting=true;
  }
  removeAlert(){
    this.alert=false;
    this.simple_alert=false;
    this.pre_alert_message="";
    this.message_alert="";
    this.waiting=false;
  }
  
  created_account = false
  new_pass = ""
  new_name = ""
  //login after account creation
  login_new(){
    var pass=this.new_pass
    var name=this.new_name
    var login = new FormData()
    login.append('name',name)
    login.append('password',pass)
    login.append('origin','mix')
    this._subs.sink = this.api.logInWithMix(login).subscribe( data => {
      if (data["response"]!=null){
        if (!data["response"].startsWith("EX-")){
          this.user.checkLoginMix(data);
          (document.getElementById("pass") as HTMLInputElement).value = '';
        } else {
          this.showAlert(this.translate.instant("user_errors.sorry"),this.translate.instant("user_errors.user_pass_invalid"))
        }
      } else {
        this.showAlert(this.translate.instant("user_errors.sorry"),this.translate.instant("user_errors.general_error"))
      }
      this.new_pass="";
      this.new_name="";
    })
  }

  email_recovery:string="";
  forgotEmail(){
    var email=(document.getElementById("f_email") as HTMLInputElement).value
    if (email==""){
      this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("B"))
      return
    } else {
      var form = new FormData();
      form.append("email", email);
      this.email_recovery=email;
      this._subs.sink = this.api.forgotEmail(form).subscribe( data => {
        if (data["response"]=="error") {
          this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("user_errors.general_error"))
          return
        }
        if (data["response"]=="not found"){
          this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("user_errors.recover_password_error"))
          return
        }
        if (data["response"]=="ok"){
          this.showAlert("MIX für ungut!", this.translate.instant("user_errors.recovery_link_sended"))
          this.mix_forgot_digit_form=true;
          return
        }
      })
    }
  }

  code_recovery = ""

  forgotSendDigits(){
    var code=(document.getElementById("f_code") as HTMLInputElement).value
    if (code==""){
      this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("user_errors.enter_code"))
      return;
    } else{
      var form = new FormData();
      form.append("code", code);
      form.append("email", this.email_recovery);
      this.code_recovery=code;
      this._subs.sink = this.api.forgotEmailSendCode(form).subscribe( data => {
        if (data["response"]=="error") {
          this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("user_errors.general_error"))
          return
        }
        if (data["response"]=="wrong"){
          this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("user_errors.incorrect_code"))
          return
        }
        if (data["response"]=="ok"){
          this.mix_forgot_pass_form=true
          return
        }
      })
    }
  }

  changePass(){
    var pass=(document.getElementById("f_pass") as HTMLInputElement).value
    var r_pass=(document.getElementById("f_repeat_pass") as HTMLInputElement).value
    if (pass==r_pass){
      var form = new FormData();
      form.append("code", this.code_recovery);
      form.append("email", this.email_recovery);
      form.append("pass", pass);
      this._subs.sink = this.api.forgotEmailChangePass(form).subscribe( data => {
        if (data["response"]=="error") {
          this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("user_errors.general_error"))
          return
        }
        if (data["response"]=="wrong"){
          this.showAlert(this.translate.instant("user_errors.sorry"), this.translate.instant("user_errors.incorrect_code"))
          return
        }
        if (data["response"]=="ok"){
          this.showAlert("MIX für ungut!", this.translate.instant("user_errors.change_password_success"))
          this.mix_forgot_pass_form=false;
          this.mix_forgot_digit_form=false;
          this.mix_forgot_form=false;
          this.email_recovery="";
          this.code_recovery="";
          return
        }
      })
    } else{
      this.showAlert('MIX für ungut!', this.translate.instant("user_errors.password_not_match"))
    }
  }
  backHistory(){
    window.history.back();
  }
  @HostListener('window:popstate') onBack() {
    if ((this.globals.login_page.getValue())&&(!this.globals.menu.getValue())){
      this.globals.login_page.next(false)
    }
  }
  @HostListener('document:keydown.enter') onKeydownHandler() {
    if (this.alert) {
      this.removeAlert()
    } else {
      if (this.mix_register_form==false && this.mix_forgot_form==false && this.mix_forgot_pass_form==false && this.mix_forgot_digit_form==false){
        this.logInMix()
      }
    }
  }
}
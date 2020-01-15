import { Injectable } from '@angular/core';
import { SocialUser, AuthService } from 'angularx-social-login';
import { GlobalsService } from "./globals.service";
import { ApiService } from "@services/api.service";
import { Router } from "@angular/router";
import { safeGetStorageItem, safeSetStorageItem, safeClearStorage, safeRemoveStorageItem } from './tools.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  social: SocialUser
  name:string=""
  id:string=""
  token:string=""
  logged_in:boolean= this.social==null ? false : true
  try:boolean=null
  origin:string=""
  mail:string=""
  setting_was=""
  setting_wann=null
  setting_wo=null
  checked_settings:boolean=false
  merkliste_total = new BehaviorSubject<number>(0)
  first_log=true
  localstorage_setting="U"
  cookies_check:boolean=false
  first_try:boolean=true
  loggedIn = new BehaviorSubject<boolean>(false)
  constructor(
    private authService: AuthService,
    private globals: GlobalsService,
    private api: ApiService,
    public router: Router
  ) { }

  signOut(): void {
    if (this.social) this.authService.signOut()
    safeRemoveStorageItem("id")
    safeRemoveStorageItem("session_token")
    safeRemoveStorageItem("session_origin")
    this.name="";
    this.id="";
    this.token="";
    this.origin="";   
    this.mail=""; 
    this.setting_was="";
    this.setting_wann="";
    this.setting_wo="";
    if (this.logged_in==true) {
      this.first_log=true;
      this.logged_in=false;
      this.loggedIn.next(false)
      this.globals.login_page.next(false)
      this.globals.settings_page.next(false)
      setTimeout(() => {
        this.router.navigate([''])
      }, 100);
     
    }
  }
  setInfo(name){
    if (this.logged_in==true){
        this.name=name
        this.globals.login_page.next(false)
    }
  }
  sendSocial(){
    if (this.social){
      var login = new FormData()
      if (this.social['provider']=='FACEBOOK') login.append('authToken',this.social['authToken'])
      if (this.social['provider']=='GOOGLE') login.append('idToken',this.social['idToken'])
      login.append('origin',this.social['provider'])
      login.append('name',this.social['name'])
      login.append('email',this.social['email'])
      login.append('localstorage','true')
      if ((safeGetStorageItem('session_token'))&&(safeGetStorageItem('id'))){
        login.append('token', safeGetStorageItem('session_token'))
        login.append('id', safeGetStorageItem('id'))
      } else{
        login.append('token',this.token)
        login.append('id',this.id)
      }
      this.api.logInWithMix(login).subscribe( data => this.checkLoginMix(data) )
    }
  }
  checkLoginMix(response){
    if (response!=null){
      if(response["response"]=='ok'){
        this.globals.login_page.next(false)
        this.logged_in=true
        this.loggedIn.next(true)
        this.setInfo(response['name'])
        if (this.globals.localStorage==true){
          safeSetStorageItem('session_token', response['token']);
          safeSetStorageItem("id", response['id']);
        }
        this.name=response["name"];
        this.id=response['id'];
        this.token=response['token'];
        this.origin='mix'
        this.mail=response['email'];
        this.checkLocalStorageSettings(response['localstorage']);
        if (response['was']!=null) this.setting_was=response['was'].substring(3);
        else this.setting_was=""
        this.setting_wann=response['wann'];
        this.setting_wo=response['wo'];
        this.checked_settings=true;
        if (this.social!=null){
          if (this.social['provider']=='GOOGLE') this.origin='google';
          if (this.social['provider']=='FACEBOOK') this.origin='facebook';
          if (this.globals.localStorage==true) safeSetStorageItem("session_origin", this.origin);
        }
        if (this.first_log==true) {
          if ((this.router.url.startsWith('/marktplatz') == true)&&(this.globals.first_kaz_search==false)){
            this.globals.updateUrl("/marktplatz")
          }
          if ((this.router.url.startsWith('/kontakte') == true)&&(this.globals.first_kaz_search==false)){
            this.globals.updateUrl("/kontakte")
          }
          if ((this.router.url.startsWith('/termine') == true)&&(this.globals.first_search==false)){
            this.globals.updateUrl(this.router.url)
          }
          this.first_log=false;
          this.getTotalPins();
        }
      } else {
        this.signOut()
      }
    } else {
      this.signOut()
    }
  }
  sendLocalMix(){
    var login = new FormData()
    if ((safeGetStorageItem('session_token'))&&(safeGetStorageItem('id'))){
      login.append('token',safeGetStorageItem('session_token'))
      login.append('id',safeGetStorageItem('id'))
      login.append('origin','mix')
      this.api.logInWithMix(login).subscribe( data => {
        this.checkLoginMix(data)
        if (data.localstorage === 'U') {
          this.globals.cookieObserverClickedNotAgree.next(false)
          this.globals.cookiesObserver.next(false)
        }
      })
    }
  }

  getTotalPins(){
    if (this.logged_in==true){
      var form = new FormData;
      form.append("id",this.id)
      form.append("token",this.token)
      if (this.social!=null){
        form.append('authToken',this.social['authToken'])
        form.append('idToken',this.social['idToken'])
        form.append('idToken',this.social['idToken'])
        form.append("origin",this.social ['provider'])
      } else {
        form.append("origin",'mix')
      }
      this.api.getTotalPin(form).subscribe( data => {
        if (data!=null){
          if(data["total"]!=null){
            this.merkliste_total.next(+data["total"])
          }
        }
      })
    } else {
      this.merkliste_total.next(0)
    }
  }

  // function that dynamically adds a new providor to the 
  // auth service's providors list so that the config files
  // for different platforms are not loaded at the start
  // but on the click

  addProviderToAuthService(id: string, providor): Promise<void> {
    return new Promise((resolve, reject) => {
      (this.authService as any).providers.set(id, providor)
      providor.initialize().then(() => {
        let readyProviders = (<any>this.authService)._readyState.getValue();
        readyProviders.push(id);
        (<any>this.authService)._readyState.next(readyProviders);
        resolve()
        providor.getLoginStatus().then((user) => {
          user.provider = id;
          (<any>this.authService)._user = user;
          (<any>this.authService)._authState.next(user);
        });
      }).catch((err) => reject(err) )
    })
  }

  //check user localstorage settings
  //U == (default) same as anonymous user, always ask
  //Y == instant agree to cookies
  //N == instant disagree with cookies
  //S == session storage (WIP)
  checkLocalStorageSettings(response){
    if (!!response) {
      this.localstorage_setting=response
    } else {
      const local = safeGetStorageItem('cookies') == 'agree'
      this.localstorage_setting = local ? 'Y' : 'U'
    }
    if ((this.localstorage_setting=='U')&&(this.cookies_check==false)){
      this.cookies_check=true;
    } 
    if (this.localstorage_setting=='Y'){
      this.globals.localStorage=true;
    }
    if (this.localstorage_setting=='N'){
      safeClearStorage()
      this.globals.localStorage=false;
    }
  }
}
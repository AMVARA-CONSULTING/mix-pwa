import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToolsService, safeGetStorageItem, safeClearStorage, safeRemoveStorageItem, SubSink } from '@services/tools.service';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialog } from 'app/dialogs/change-password/change-password.dialog';
import { ChangeEmailDialog } from 'app/dialogs/change-email/change-email.dialog';

@Component({
  selector: 'mix-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'handleClick($event)',
  }
})
export class UserSettingsComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  change_email = false
  change_pass = false
  rubrik_selected:string
  wann_selected:string
  orte_selected:string

  constructor(
    public translate: TranslateService,
    public globals:GlobalsService,
    private api:ApiService,
    public user: UserService,
    private _sanitizer: DomSanitizer,
    private _fb: FormBuilder,
    private _tools: ToolsService,
    private _dialog: MatDialog
  ) {
    this.resetEmail = this._fb.group({
      password: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])]
    })
  }

  resetEmail: FormGroup

  ngOnInit() {
    this.loadOrte();
    this.getSelected();
    this.globals.login_page.next(false)
    this.globals.merkliste_page.next(false)
    this.globals.changeBody(true)
    setTimeout(() => {
      this.globals.changeBody(true)
    }, 100);
  }
  ngOnDestroy(){
    this._subs.unsubscribe()
    this.globals.changeBody(false)
  }
  getUserIcon(origin){
    origin=origin.toLowerCase()
    if (origin=='mix') return this._sanitizer.bypassSecurityTrustStyle(`url(/assets/social/MIXICON_Mix_Imag.svg)`);
    if (origin=='facebook') return this._sanitizer.bypassSecurityTrustStyle(`url(/assets/social/MIXICON_Facebook_Imag.svg)`);
    if (origin=='google') return this._sanitizer.bypassSecurityTrustStyle(`url(/assets/social/MIXICON_Google_Imag.svg)`);
  }

  manual_reset=false;
  //mark waswannwo setting with a tick if already selected on db
  getSelected(){
    if (this.manual_reset==true){
      this.rubrik_selected=null
      this.wann_selected=null
      this.orte_selected=null
      this.orte_filter_show=[];
      this.manual_reset=false;
    }
    else{
      this.rubrik_selected=this.user.setting_was
      this.wann_selected=this.user.setting_wann
      this.orte_selected=this.user.setting_wo
    }
     
    
  }
  //when clicking on checkbox rubrik, see if rubrik exists on array, if it already exists remove it, else add it
  rubrik_arr = []
  rubrik_arr_form = []

  addSearchRubrik(event){
    if (this.rubrik_arr_form.indexOf(event.target.value)==-1){
      this.rubrik_arr_form.push(event.target.value)
    }
    else {
      var key=this.rubrik_arr_form.indexOf(event.target.value)
      this.rubrik_arr_form.splice(key,1);
    }
  }

  formday: number = safeGetStorageItem("formday")==null ? 7 : parseInt(safeGetStorageItem("formday"));
  day_value = "7 days";

  changeFormDays(n){
    this.formday=n;
    this.formhour=-1;
    safeRemoveStorageItem("formhour");
  }


  formhour: number = safeGetStorageItem("formhour")==null ? -1 : parseInt(safeGetStorageItem("formhour"));
  changeFormHours(n){
    this.formday=0;
    this.formhour=n;
    safeRemoveStorageItem("formday");
  }
  wo_search:string=""

  getWo(event){
    this.wo_search=event.target.value.toLowerCase();
  }

  focus_orte = false
  orte_array: any[]
  
  loadOrte(){
    if (this.orte_array==undefined){
      this._subs.sink = this.api.getAllOrte().subscribe( data => {
        this.orte_array = data
        this.initOrteSel()
      })
    } 
    this.focus_orte=true
  }

  orte_filter: string[] = []
  orte_filter_show = []

  //when clicking on orte on wo filter add it to the show array (visible) and filter array (sent to backend)
  loadLocation(event){
    this.orte_filter_show.push(event);
    if (event["region"]!=""){
      this.orte_filter.push(event['adressid']+"/"+event['adressname']+"/"+event['region']);
    } else {
      this.orte_filter.push(event['missing_adressid']+"/"+event['adressname']+"/"+event['region']);
    }
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else{
      form.append("origin",'mix')
    }
    form.append("mode", 'wo_add');
    form.append("wo", event['adressid']);
    this._subs.sink = this.api.setWasWannWo(form).subscribe( _ => this.resetWasWannWo() )
  }

  removeLocation(event){
    var index = this.orte_filter_show.indexOf(event);
    if (index !== -1) this.orte_filter_show.splice(index, 1);
    //remove from filter list(what is sent to backend)
    if (event["region"]!=""){
      var index = this.orte_filter.indexOf(event['adressid']);
      if (index !== -1) this.orte_filter.splice(index, 1);
    } else {
      var index = this.orte_filter.indexOf(event['missing_adressid']);
      if (index !== -1) this.orte_filter.splice(index, 1);
    }
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else{
      form.append("origin",'mix')
    }
    form.append("mode", 'wo_del');
    form.append("wo", event['adressid']);
    this._subs.sink = this.api.setWasWannWo(form).subscribe( _ => this.resetWasWannWo() )
  }
  compareOrt(adress, region){
    return this.wo_search.indexOf(adress.toLowerCase()) != -1 || this.wo_search.indexOf(region.toLowerCase()) != -1
  }

  openChangePassword() {
    this._dialog.open(ChangePasswordDialog, { maxWidth: '400px' })
  }

  openChangeEmail() {
    this._dialog.open(ChangeEmailDialog, { maxWidth: '400px' })
  }


  changeEmail(values: any){
    if (values.password==""){
      this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.no_password"))
      return
    } 
    if (values.email==""){
      this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.no_email"))
      return
    }
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else {
      form.append("origin",'mix')
    }
    form.append("password", values.password)
    form.append("email", values.email)
    this._subs.sink = this.api.changeEmail(form).subscribe( data => {
      if (data['response']=='taken') this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.email_taken"))
      if (data['response']=='invalid') this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.invalid_password"))
      if (data['response']=='valid') {
        if (this.user.social!= null) this.user.sendSocial()
        else this.user.sendLocalMix();
        this.showAlert(this.translate.instant("user_errors.success_title"), this.translate.instant("user_errors.change_email_success"))
      }
      if (data['response']=='email_error') this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.invalid_email"))
      if (data['response'].startsWith("EX")==true){
        this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"))
        this.user.signOut();
      }
    })
  }
  waiting_remove_account = false
  waiting_remove_assistance = false
  waiting_remove_merkliste = false

  resetAssistance(){
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else {
      form.append("origin",'mix')
    }
    this._subs.sink = this.api.resetAssistance(form).subscribe( data => {
      if (data['response']=='valid') {
        this.showAlert(this.translate.instant("user_errors.success_title"), this.translate.instant("user_errors.delete_assistance"))
        safeClearStorage()
        this._tools.clearCookies()
        this.user.signOut()
        this.globals.settings_page.next(false)
      }
      if (data['response']==null) {
        this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"))
      }
      if (data['response'].startsWith("EX")){
        this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"))
        this.user.signOut();
      }
    })
  }

  resetMerkliste() {
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else {
      form.append("origin",'mix')
    }
    this._subs.sink = this.api.resetMerkliste(form).subscribe( data => {
      if (data['response']=='valid') {
        this.user.getTotalPins()
        this.showAlert(this.translate.instant("user_errors.success_title"), this.translate.instant("user_errors.delete_merkliste"))
      }
      if (data['response']==null) {
        this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"))
      }
      if (data['response'].startsWith("EX")){
        this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"))
        this.user.signOut();
      }
    })
  }

  deleteAccount(){
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else {
      form.append("origin",'mix')
    }
    this._subs.sink = this.api.deleteAccount(form).subscribe( data => {
      if (data['response']=='valid') {
        this.user.signOut()
        this.showAlert(this.translate.instant("user_errors.success_title"), this.translate.instant("user_errors.delete_account"))
      }
      if (data['response']==null) {
        this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"))
      }
      if (data['response'].startsWith("EX")){
        this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"))
        this.user.signOut();
      }
    });
  }
  simple_alert:boolean=false;
  waiting:boolean=false;
  alert:boolean=false;
  pre_alert_message:string="";
  message_alert:string="";
  showAlert(pre_alert, message){
    this.alert=true;
    this.pre_alert_message=pre_alert;
    this.message_alert=message;
    this.waiting=true;
  }
  removeAlert(){
    this.waiting_remove_assistance=false;
    this.waiting_remove_merkliste=false;
    this.waiting_remove_account=false;
    this.alert=false;
    this.simple_alert=false;
    this.pre_alert_message="";
    this.message_alert="";
    this.waiting=false;
  }

  changeWasWannWo(event, mode){
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else{
      form.append("origin",'mix')
    }
    if (mode=='default'){
      form.append("mode","default")
    }
    if (mode=='was'){
      form.append("mode","was")
      form.append("was",event.target.value)
    }
    if (mode=='wann'){
      form.append("mode","wann")
      form.append("wann",event.target.value)
    }
    this._subs.sink = this.api.setWasWannWo(form).subscribe( _ => this.resetWasWannWo() )
      
  }

   suche_focus:boolean=false;
   //check if clicked inside or outside ansicht, exit ansicht if outside // when on was wann wo check if you click outside the wo list and if true hide the list
   handleClick(event){
    if ((event.target['id']=='waswannwo')||(event.target['id']=='')) {
      this.suche_focus=false
    }
  }

  //send another request to get the updated info
  resetWasWannWo(){
    if (this.user.logged_in){
      if (this.user.social!= null) {
        this.user.sendSocial()
      } else {
        if (safeGetStorageItem('session_token')!=null) {
          this.user.sendLocalMix()
        }
      }
      this.getSelected()
    }
  }

  checkSelectedWas(rubrik){
    var found=false
    if ((this.rubrik_selected!=null)&&(this.rubrik_selected!="")){
      var rubrik_db=this.rubrik_selected.split("---")
      rubrik_db.forEach(element => {
        if (rubrik==element) {
          found=true
        }
      });
    }
    return found
  }
  checkSelectedWann(value){
    var wann=this.wann_selected
    if(wann==value.toString()) return true
    return false
  }

   //load the selected orte list using db or localstorage info
  initOrteSel(){
    if (this.orte_selected!=null){
      this.user.setting_wo.split("#,#").forEach(filter => {
        this.orte_array.forEach(selected => {
          if ( (selected['adressid'])==filter || (selected['missing_adressid']==filter) ){
            this.orte_filter_show.push(selected)
          } 
        });
      });
    } else {
      this.orte_filter_show = []
    }
  }

  localStorageSettings(value,mode){
    var form = new FormData()
    form.append("id",this.user.id)
    form.append("token",this.user.token)
    if (this.user.social!=null){
      form.append('authToken',this.user.social['authToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append('idToken',this.user.social['idToken'])
      form.append("origin",this.user.social ['provider'])
    } else {
      form.append("origin",'mix')
    }
    form.append("mode",mode)
    form.append("localstorage",value)
    this._subs.sink = this.api.localStorage(form).subscribe( data => {
      if (data!=null){
        this.user.localstorage_setting = value
        if ((data["response"]==this.translate.instant("user_errors.error_title"))&&(mode=="set")){
          this.showAlert(this.translate.instant("user_errors.error_title"), this.translate.instant("user_errors.general_error"));
        }
      }
    })
  }

  @HostListener('window:popstate') onBack() {
    if ((this.globals.settings_page.getValue())&&(!this.globals.menu.getValue())){
      this.globals.settings_page.next(false)
    }
  }

  backHistory(){
    window.history.back()
  }
}
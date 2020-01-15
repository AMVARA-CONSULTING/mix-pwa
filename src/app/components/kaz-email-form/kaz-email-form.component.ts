import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { GlobalsService } from '@services/globals.service';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SubSink } from '@services/tools.service';


@Component({
  selector: 'mix-kaz-email-form',
  templateUrl: './kaz-email-form.component.html',
  styleUrls: ['./kaz-email-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KazEmailFormComponent implements OnInit, OnDestroy {

  _subs = new SubSink()

  // I/O Events

  @Input() columns: number
  @Output() mail: EventEmitter<any> = new EventEmitter<any>()
  @Input() email: string
  @Input() kaz_text: string
  @Input() perPost: boolean
  @Input() returnTo: string

  sending = new BehaviorSubject<boolean>(false)

  // Properties

  form: FormGroup
  waiting = new BehaviorSubject<boolean>(false)
  image_cont: number = 0
  max_file_size: number = 3145728
  max_files: number = 4
  message_alert = new BehaviorSubject<string>('')
  alert = new BehaviorSubject<boolean>(false)
  pre_alert_message = new BehaviorSubject<string>('')
  captcha_required = new BehaviorSubject<boolean>(false)

  images = new BehaviorSubject<File[]>([])
  loadingImages = new BehaviorSubject<boolean>(false)

  hover_cap: boolean = false
  check_return: any
  name = new FormControl("", Validators.required)
  contact = new FormControl("", Validators.required)
  email_error = false
  text = new FormControl("", Validators.required)
  text_error = false
  captcha = new FormControl("")

  imagen = []

  send_success = false

  language: string = 'de'

  constructor(
    private _fb: FormBuilder,
    private api: ApiService,
    public user: UserService,
    public globals: GlobalsService,
    private _translate: TranslateService
  ) {
    // @ts-ignore
    this.language = navigator.language || navigator.userLanguage
    this.form = this._fb.group({
      "name": this.name,
      "email": this.contact,
      "text": this.text,
      "captcha": this.captcha
    })
  }


  //exit and delete the email id
  passMail() {
    this.email = '';
    this.mail.emit(this.email);
  }

  //whenever an image is sucesfully selected
  image_len = 0;
  onFileChange(event) {
    var i = 0;
    for (i = 0; i < event.target.files.length; i++) {
      if (!!event.target.files[i]) {
        this.imagen[this.image_cont] = event.target.files[i];
        this.image_cont++;
      }
    }
  }
  //whenever an image is removed (remove the corresponding image from the array)
  onRemoved(event) {
    var i: number;
    for (i = 0; i < this.imagen.length; i++) {
      if (this.imagen[i] == event.file) {
        this.imagen.splice(i, 1);
      }
    }
    this.image_cont--;
  }

  //pass the values to backend and show the success message
  onSubmit() {
    // Manual check form
    if (this.checkForm()) {
      // Construct the send data
      let form = new FormData();
      form.append('name', this.name.value)
      form.append('contact', this.contact.value)
      form.append('text', this.text.value)
      form.append('id', this.email)
      if (!!this.user.id) form.append('user', this.user.id)
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        form.append('source', "mobile")
      }
      else {
        form.append('source', "web")
      }
      // Reformat images of the form
      const images = this.images.getValue()
      for (let i = 0; i < images.length; i++) {
        form.append('image' + String(i), images[i])
      }
      // Send mail form
      this.sending.next(true)
      this._subs.sink = this.api.sendMailForm(form).subscribe(
        data => {
          if (data.success) {
            this.pre_alert_message.next(this._translate.instant('kontaktform.send_success_title'))
            this.message_alert.next(this._translate.instant('kontaktform.send_success_body'))
            this.alert.next(true)
            this.send_success = true
          } else {
            this.pre_alert_message.next('MIX für ungut!')
            this.message_alert.next(data.error)
            this.alert.next(true)
          }
        },
        err => {
          this.check_return = "Something went wrong!";
        },
        () => {
          this.sending.next(false)
        }
      )
    }
  }
  checkImageFilename() {
    var i: number;
    var image_names: string = "";
    for (i = 0; i < this.imagen.length; i++) {
      if (!!this.imagen[i]) {
        image_names = image_names + this.imagen[i].name + ';'
        if (this.imagen[i].name.length > 150) {
          var max_length = true;
        }
      }
    }
    if (image_names.length > 255) {
      this.alert.next(true)
      this.pre_alert_message.next("Unsere Programmierung hat festgestellt, dass noch Informationen fehlen. Bitte  fülle folgende Felder aus: ")
      this.message_alert.next(this.message_alert.getValue() + "Combined uploaded image filenames too long<br>")
    }
    if (max_length == true) {
      this.alert.next(true)
      this.pre_alert_message.next("Unsere Programmierung hat festgestellt, dass noch Informationen fehlen. Bitte  fülle folgende Felder aus: ")
      this.message_alert.next(this.message_alert.getValue() + "One of the uploaded image filename is too long<br>")
    }
  }


  //check if form is completed if not output what is missing on screen
  checkForm(): boolean {
    this.waiting.next(true)
    this.message_alert.next('')
    this.pre_alert_message.next('')
    const fields = []
    if (this.contact.invalid) {
      fields.push(this._translate.instant('kontaktform.email'))
      this.email_error = true
    }
    if (this.text.invalid) {
      this.text_error = true
      fields.push(this._translate.instant('kontaktform.nachricht'))
    }
    try {
      const validator = this.captcha.validator({} as AbstractControl);
      if (validator && validator.required && this.captcha.invalid) {
        fields.push(this._translate.instant('kontaktform.captcha'))
      }
    } catch (err) {
      // console.log("AMVARA", "User is from Germany")
    }
    if (this.image_cont > 3) {
      fields.push(this._translate.instant('kontaktform.max_images'))
    }
    if (fields.length > 0) {
      this.pre_alert_message.next('MIX für ungut!')
      this.message_alert.next(this._translate.instant('kontaktform.errmsg_form_invalid') + fields.join(', '))
      this.alert.next(true)
    }
    // this.checkImageFilename()
    if (!this.alert.getValue()) {
      this.waiting.next(false)
    }
    return !this.alert.getValue()
  }


  ngOnInit() {
    document.body.style.overflowY = 'hidden';
    this._subs.sink = this.api.getCaptcha().subscribe(captcha => {
      // @ts-ignore
      this.captcha_required.next(captcha.required)
      // @ts-ignore
      if (captcha.required) {
        this.captcha.setValidators([Validators.required])
      } else {
        this.captcha.setValidators([])
      }
      this.captcha.updateValueAndValidity()
    }, err => {
      this.pre_alert_message.next('MIX für ungut!')
      this.message_alert.next(this._translate.instant('aufgeben.error_request'))
      this.alert.next(true)
    })
  }

  ngOnDestroy() {
    document.body.removeAttribute('style')
    this._subs.unsubscribe()
  }

  imageUpload() {
    (document.querySelector('#image_upload') as HTMLInputElement).click()
  }

  RemoveImage(e) {
    let images = this.images.getValue()
    images.splice(e, 1)
    this.images.next(images)
  }

  alertFalse() {
    this.alert.next(false)
    this.waiting.next(false)
    if (this.send_success) {
      this.passMail()
      this.backHistory()
    }
  }

  @HostListener('window:popstate') onBack() {
    if (!this.globals.menu.getValue()) {
      this.passMail();
    }
  }

  backHistory() {
    window.history.back()
  }

  // Trigger for images
  onImageChange(event) {
    this.loadingImages.next(true)
    const validExtensions = [
      'jpeg',
      'jpg',
      'png',
      'gif',
      'tif',
      'tiff'
    ]
    let files: File[] = event.target.files
    const filesB = this.images.getValue()
    if ((files.length + filesB.length) > 5) {
      this.pre_alert_message.next('MIX für ungut!')
      this.message_alert.next(this._translate.instant('kontaktform.max_files'))
      this.alert.next(true);
      (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      this.loadingImages.next(false)
      return
    }
    if (files.length > 5) {
      this.pre_alert_message.next('MIX für ungut!')
      this.message_alert.next('Can\'t upload more than 5 files at once')
      this.alert.next(true);
      (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      this.loadingImages.next(false)
      return
    }
    if (filesB.length > 5) {
      this.pre_alert_message.next('MIX für ungut!')
      this.message_alert.next('Current image files exceeds the maximum allowed (5)')
      this.alert.next(true);
      (document.querySelector('#image_upload') as HTMLInputElement).value = ''
      this.loadingImages.next(false)
      return
    }
    const requests = []
    for (let file of files) {
      const formData = new FormData()
      formData.append('file', file)
      requests.push(this.api.checkFileMIME(formData))
    }
    this._subs.sink = forkJoin(...requests).subscribe(mimes => {
      files = Array.from(files)
      files.forEach((file, i) => {
        const mime = mimes[i].mime
        if (validExtensions.indexOf(mime.split('/').pop().toLowerCase()) > -1) {
          const files = this.images.getValue()
          files.push(file)
          this.images.next(files)
        }
        this.loadingImages.next(false)
      });
      (document.querySelector('#image_upload') as HTMLInputElement).value = ''
    })
  }
}

import { Component, ChangeDetectionStrategy, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BehaviorSubject } from "rxjs";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { GoogleLoginProvider, AuthService, FacebookLoginProvider } from "angularx-social-login";
import * as Sentry from '@sentry/browser';
import { UserService } from "@services/user.service";

@Component({
  selector: 'mix-social-permission',
  templateUrl: 'social-permission.html',
  styleUrls: ['./social-permission.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialPermission {

  constructor(
    public dialogRef: MatDialogRef<SocialPermission>,
    private _user: UserService,
    private _auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public provider: LoginProvider
  ) {
    this.google.next(provider == LoginProvider.GOOGLE)
    this.facebook.next(provider == LoginProvider.FACEBOOK)
    
  }

  google = new BehaviorSubject<boolean>(false)
  facebook = new BehaviorSubject<boolean>(false)

  loading = new BehaviorSubject<boolean>(false)

  loaded = new BehaviorSubject<boolean>(false)

  handleChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.loading.next(true)
      switch (this.provider) {
        case LoginProvider.GOOGLE:
            this._user.addProviderToAuthService(GoogleLoginProvider.PROVIDER_ID, new GoogleLoginProvider('123456789123-12abc3de4f5g6h7ij8klmnopqrs91tv2.apps.googleusercontent.com'))
            .then(_ =>  this.loaded.next(true))
            .catch(err => {
              try {
                Sentry.captureException(err);
              } catch (err) { }
            })
            .finally(() => this.loading.next(false))
          break;
        case LoginProvider.FACEBOOK:
            this._user.addProviderToAuthService(FacebookLoginProvider.PROVIDER_ID, new FacebookLoginProvider('264502081146334', {}, 'de_DE'))
            .then(_ =>  this.loaded.next(true))
            .catch(err => {
              try {
                Sentry.captureException(err);
              } catch (err) { }
            })
            .finally(() => this.loading.next(false))
          break;
        default:
      }
    } else {
      this.loaded.next(false)
    }
  }

  signIn() {
    switch (this.provider) {
      case LoginProvider.GOOGLE:
          this._auth.signIn(GoogleLoginProvider.PROVIDER_ID)
        break;
      case LoginProvider.FACEBOOK:
          this._auth.signIn(FacebookLoginProvider.PROVIDER_ID)
        break;
      default:
    }
    this.dialogRef.close()
  }

}

export enum LoginProvider {
  GOOGLE,
  FACEBOOK
}
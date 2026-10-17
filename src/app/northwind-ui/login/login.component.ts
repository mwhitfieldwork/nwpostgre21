import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AuthLoginComponent } from "./auth-form/auth-form.component";
import { Authentication } from '../../utilities/models/authentication';
import { MatCardModule } from '@angular/material/card';
import { LoginService } from '../../utilities/services/login/login.service';
import { Router } from '@angular/router';
import { UserSessionService } from '../../utilities/services/user-session/user-session.service';
import { BasicButtonComponent } from '../../shared/basic-button/basic-button.component';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [AuthLoginComponent, MatCardModule, BasicButtonComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
private _loginService = inject(LoginService)
private _oauthService = inject(OAuthService)
private _userSessionService = inject(UserSessionService)
private router = inject(Router)
signInErrorMessage = '';

  constructor() {
    // console.log('UserSessionService instance created');
  }

  ngOnInit() {
  }

  get isLoggedIn(){
    return !!this._loginService.identityClaims
  }

  login(){
    this._loginService.login();
  }

   logout(){
    this._loginService.logout();
  } 


  createUser($event:Authentication){
    this._loginService.createUser($event).subscribe((response) => {
      // console.log(response);
    });
  }

  // Signs in with email/password.
  // The API replies with { value, statusCode }.
  // "value" is either the login data (success) or an error message (text).
  verifyUser($event: Authentication) {
    this._loginService.AuthenticateUser($event).subscribe((response) => {
      const result = response.value;

      // If "value" is text, the API is telling us what went wrong.
      // After this check, TypeScript knows "result" is a string here...
      if (typeof result === 'string') {
        this.signInErrorMessage = result;
        return;
      }

      // ...and down here it knows "result" is a LoginResponse,
      // so .message, .token and .user are all checked for typos.
      if (result.message === 'Authentication successful.') {
        this._loginService.saveToken(result.token);
        this._userSessionService.setUser(result.user.pkid.toString());
        this.router.navigate(['/dashboard']).then(() => {
          window.location.reload();
        });
      }
    });
  }

}

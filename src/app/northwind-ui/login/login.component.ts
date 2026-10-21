import { Component, inject, ViewEncapsulation } from '@angular/core';
import { AuthLoginComponent } from "./auth-form/auth-form.component";
import { Authentication } from '../../utilities/models/authentication';
import { MatCardModule } from '@angular/material/card';
import { LoginService } from '../../utilities/services/login/login.service';
import { Router } from '@angular/router';
import { UserSessionService } from '../../utilities/services/user-session/user-session.service';
import { BasicButtonComponent } from '../../shared/basic-button/basic-button.component';
import { OAuthService } from 'angular-oauth2-oidc';
import { isLoginResponse } from '../../utilities/models/login-response';

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

          // isLoginResponse is our type guard (in login-response.ts).
          // If it says no, "result" is the error text from the API.
          if (!isLoginResponse(result)) {
            this.signInErrorMessage = result;   // TypeScript knows this is a string
            return;
          }


        // From here on, TypeScript knows "result" is a LoginResponse,
        // so .token and .user are checked for typos.
        this._loginService.saveToken(result.token);
        this._userSessionService.setUser(result.user.pkid.toString());
        this.router.navigate(['/dashboard']).then(() => {
          window.location.reload();
        });
    });
  }

}

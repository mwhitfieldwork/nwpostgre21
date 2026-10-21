import { Component, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { LoginService } from '../utilities/services/login/login.service';
import { UserSessionService } from '../utilities/services/user-session/user-session.service';
import { isLoginResponse } from '../utilities/models/login-response';

@Component({
  selector: 'app-auth-callback',
  standalone:true,
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.scss',
})
export class AuthCallbackComponent {

  private oauthService = inject(OAuthService);
  private router = inject(Router);
  private loginService = inject(LoginService)
  private userSessionService = inject(UserSessionService)

  ngOnInit() {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      console.error('No authorization code in callback URL');
      return;
    }

    this.loginService.exchangeGoogleCode(code).subscribe({
      next: (response) => {
        /*
        That’s the spot. Right now it checks the message 
        text ('Authentication successful.'). That’s fragile: if someone 
        on the API changes the wording to “Login successful”, 
        login breaks even though the data is fine.

        The guard checks what actually matters: is there a token, and is there a user?
        */
        /**
         * WHAT: Only log in if the reply really has a token and a user.
         * WHY:  Checking the message text breaks if the wording changes.
         *       Checking the data protects saveToken from "undefined".
         * HOW:  isLoginResponse is our type guard. Inside the if,
         *       TypeScript knows response is a real LoginResponse.
         */
        if (isLoginResponse(response)) {
          this.loginService.saveToken(response.token);
          this.userSessionService.setUser(String(response.user.pkid));
          this.router.navigate(['/dashboard']).then(() => {
            window.location.reload();
          });
        } else {
          console.error('OAuth login failed');
        }
      },
      error: (err) => console.error('Google sign-in failed', err)
    });
  }
}

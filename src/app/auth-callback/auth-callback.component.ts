import { Component, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { LoginService } from '../utilities/services/login/login.service';
import { UserSessionService } from '../utilities/services/user-session/user-session.service';

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
        if (response?.message === 'Authentication successful.') {
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

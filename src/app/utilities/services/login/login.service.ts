import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter, Observable, switchMap } from 'rxjs';
import { Authentication } from '../../models/authentication';
import { environment } from '../../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthConfig } from 'angular-oauth2-oidc';
import {authConfig} from '../.././../auth.config'
import { LoginResponse, WrappedLoginResponse } from '../../../utilities/models/login-response'
import { ApiUser } from '../../models/api-user';
import { Router } from '@angular/router';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  url:string = environment.apiUrl;
  private _http = inject(HttpClient);
  private _oauthService = inject(OAuthService);
  private readonly tokenKey = 'nw_token';
  private _router = inject(Router);
  // Holds the "alarm" so we can cancel it later (on logout or a new login)
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  userProfile$ = this._oauthService.events.pipe(
    filter(e => e.type === 'token_received'),
    switchMap(() => this.userProfile)
  );


  login(){
    this._oauthService.initLoginFlow();
  }

  logout(){
    this.clearToken();
    this._oauthService.logOut();
  }

  get identityClaims(){
    return this._oauthService.getIdentityClaims();
  }


  get accessToken(){
    return this._oauthService.getAccessToken();
  }

// Sends Google's one-time code to our API.
// The API answers with a message, the user and our own JWT token.
exchangeGoogleCode(code: string): Observable<LoginResponse> {
  const url = `${this.url}/api/Login/GoogleCallback`;
  return this._http.post<LoginResponse>(url, { code }, httpOptions);
}

  get userProfile() {
    const url = "https://www.googleapis.com/oauth2/v2/userinfo";
    return this._http.get(url, {
      headers:{
        Authorization: `Bearer ${this.accessToken}`
      }
    })
  }
  
  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.startExpiryTimer(); // new token, so set a new alarm
  }

  clearToken() {
    this.stopExpiryTimer(); // no token, so no alarm
    localStorage.removeItem(this.tokenKey);
  }

  // WHAT: Reads the expiry time out of the token, in milliseconds.
  // WHY:  Both the expired check and the alarm need this number.
  // HOW:  A JWT has 3 parts joined by dots. The middle part holds the data.
  //       "exp" in there is seconds since 1970, so we multiply by 1000.
  private tokenExpiresAt(): number | null {
    const token = this.token;
    if (!token) return null;

    try {
      // The middle part uses "base64url": swap two characters so atob() can read it
      const middle = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(atob(middle));
      return data.exp * 1000;
    } catch {
      return null; // a broken token has no usable expiry
    }
  }

  isTokenExpired(): boolean {
    const expiresAt = this.tokenExpiresAt();
    return expiresAt === null || Date.now() >= expiresAt;
  }

  // WHAT: Sets an alarm that logs the user out the moment the token expires.
  // WHY:  Without it, someone could sit on a page with a dead token.
  // HOW:  Work out how many milliseconds are left, then setTimeout for that long.
  startExpiryTimer(): void {
    this.stopExpiryTimer(); // never run two alarms at once

    const expiresAt = this.tokenExpiresAt();
    if (expiresAt === null) return;

    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) {
      this.expireSession(); // already expired, so act now
      return;
    }

    this.expiryTimer = setTimeout(() => this.expireSession(), msLeft);
  }

  stopExpiryTimer(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  // What happens when the alarm goes off
  expireSession(): void {
    this.clearToken();
    this._router.navigate(['']); // '' is your login route
  }
  
  createUser(authentication: Authentication): Observable<ApiUser> {
    let url = `${this.url}/api/Login/AddUser`;
    let newLogin = JSON.stringify(authentication)
    var response = this._http.post<ApiUser>(url, newLogin, httpOptions);
    // console.log(url,1);
    return response;
  }

  AuthenticateUser(authentication: Authentication): Observable<WrappedLoginResponse> {
    let url = `${this.url}/api/Login`;
    let newLogin = JSON.stringify(authentication)
    var response = this._http.post<WrappedLoginResponse>(url, newLogin, httpOptions);
    // console.log(url, 2);
    return response;
  }
}

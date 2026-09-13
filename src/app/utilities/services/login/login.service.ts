import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter, Observable, switchMap } from 'rxjs';
import { Authentication } from '../../models/authentication';
import { environment } from '../../../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthConfig } from 'angular-oauth2-oidc';
import {authConfig} from '../.././../auth.config'

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
  errorMessage:any;
  private _http = inject(HttpClient);
  private _oauthService = inject(OAuthService)


  userProfile$ = this._oauthService.events.pipe(
    filter(e => e.type === 'token_received'),
    switchMap(() => this.userProfile)
  );


  login(){
    this._oauthService.initLoginFlow();
  }

  logout(){
    this._oauthService.logOut();
  }

  get identityClaims(){
    return this._oauthService.getIdentityClaims();
  }


  get accessToken(){
    return this._oauthService.getAccessToken();
  }

  exchangeGoogleCode(code: string): Observable<any> {
    const url = `${this.url}/api/Login/GoogleCallback`;
    return this._http.post(url, { code }, httpOptions);
  }

  get userProfile() {
    const url = "https://www.googleapis.com/oauth2/v2/userinfo";
    return this._http.get(url, {
      headers:{
        Authorization: `Bearer ${this.accessToken}`
      }
    })
  }
  
  createUser(authentication: Authentication): Observable<any> {
    let url = `${this.url}/api/Login/AddUser`;
    let newLogin = JSON.stringify(authentication)
    var response = this._http.post<Authentication>(url, newLogin, httpOptions);
    console.log(url,1);
    return response;
  }

  AuthenticateUser(authentication: Authentication): Observable<any> {
    let url = `${this.url}/api/Login`;
    let newLogin = JSON.stringify(authentication)
    var response = this._http.post<Authentication>(url, newLogin, httpOptions);
    console.log(url, 2);
    return response;
  }
}

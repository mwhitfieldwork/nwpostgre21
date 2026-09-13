import { inject, Injectable, signal } from '@angular/core';
import { Authentication } from '../../models/authentication';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model'
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {
  private _http = inject(HttpClient);
  private userSubject = new BehaviorSubject<Authentication | null>(null);
  public user$: Observable<Authentication | null> = this.userSubject.asObservable();

  url:string = environment.apiUrl;
  errorMessage:any;
  
public get currentUser(): Authentication | null {
  return this.userSubject.getValue();
}

  setUser(id:string): void {
      localStorage.setItem('user', JSON.stringify(id)); 
  }

  getUser(userId: string): Observable<Authentication> {
    let url = `${this.url}/api/Login/${userId}`;
    var response = this._http.get<Authentication>(url)
      .pipe(
        tap(item => {
          this.userSubject.next(item);
        }),
        catchError(this.handleError),
      )

    return response
  }
  
  private handleError(error: Response) {
    console.error(error);
    return throwError(() => error || 'Server error');
  }

}

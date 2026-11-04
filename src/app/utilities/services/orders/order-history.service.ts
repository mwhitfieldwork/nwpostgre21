import { inject, Injectable } from '@angular/core';
import { OrderDetails } from '../../models/order-detail';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_URL } from '../../tokens/api-url.token';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private _http = inject(HttpClient)
url: string = inject(API_URL);
  
  constructor() { }

  get(): Observable<OrderDetails[]> {
    return this._http.get<OrderDetails[]>(`${this.url}/api/OrderHistory/`)
    .pipe( 
      tap(items => {
        // console.log(this.url)
      }),
      catchError(this.handleError),
    )
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(() => error || 'Server error');
  }
}

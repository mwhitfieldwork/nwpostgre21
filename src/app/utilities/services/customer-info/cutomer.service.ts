import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DistinctCustomer } from '../../models/distinctCustomers.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CustomerProducts } from '../../models/customerProducts.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CutomerService {
  private _http = inject(HttpClient)
  
  url:string = environment.apiUrl;

  constructor() { }

  getCustomers(): Observable<DistinctCustomer[]> {
    var response = this._http.get<DistinctCustomer[]>(`${this.url}/Category/TopCustomers`)
      .pipe(
        tap(items => {
          //console.log(items, 'Categories')
        }),
        catchError(this.handleError),
      )

    return response
  }

  getProductsByCustomer(id:string): Observable<CustomerProducts[]> {
    // console.log(id, 'ID')
    var response = this._http.get<CustomerProducts[]>(`${this.url}/Category/${id}`)
      .pipe(
        tap(items => {
         // console.log(items, 'Cutomer Products')
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

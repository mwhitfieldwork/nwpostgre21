import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError,shareReplay  } from 'rxjs';
import { BarOrderDetail } from '../../models/bar-order-detail';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SalesTotal } from '../../models/salesTotal';
import { SalesLine } from '../../models/sales-line.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private _http = inject(HttpClient)
  private allSales$?: Observable<SalesLine[]>;
  private rangeCache = new Map<string, Observable<SalesLine[]>>();  
  url:string =  environment.apiUrl;
  errorMessage:any;
  
  constructor() { }

  getOrderDetails(): Observable<BarOrderDetail[]> {
    return this._http.get<BarOrderDetail[]>(`${this.url}/Dashboard/totals`)
    .pipe( 
      tap(items => {
        console.log(this.url,)
      }),
      catchError(this.handleError),
    )
  }

  getSalesTotals(beginningDate: string, endingDate: string): Observable<SalesTotal[]> {
    return this._http.get<SalesTotal[]>(`${this.url}/Dashboard/salestotals?beginningDate=${beginningDate}&endingDate=${endingDate}`)
    .pipe( 
      tap(items => {
        console.log(this.url, '--sales totals');
      }),
      catchError(this.handleError),
    )
  }

  getAllSales(): Observable<SalesLine[]> {
    if (!this.allSales$) {
      this.allSales$ = this._http
        .get<SalesLine[]>(`${this.url}/Dashboard/sales`)
        .pipe(shareReplay(1));
    }
    return this.allSales$;
  }

  getSalesByDateRange(beginningDate: string, endingDate: string): Observable<SalesLine[]> {
    const key = `${beginningDate}|${endingDate}`;

    if (!this.rangeCache.has(key)) {
      this.rangeCache.set(
        key,
        this._http
          .get<SalesLine[]>(`${this.url}/Dashboard/sales/range`, {
            params: { beginningDate, endingDate },
          })
          .pipe(shareReplay(1))
      );
    }
    return this.rangeCache.get(key)!;
  }  

  private handleError(error: Response) {
    console.error(error);
    return throwError(() => error || 'Server error');
  }
}

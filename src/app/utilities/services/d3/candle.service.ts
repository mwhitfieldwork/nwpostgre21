import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // keep your existing path
import { ProductSalesCandle } from '../../../utilities/models/product-sales-candle.model'; // keep your existing path

/**
 * WHAT: Gets weekly candlestick data (all sales combined) from the .NET API.
 * WHY:  Keeps HTTP code out of the chart component, so the component
 *       only worries about drawing.
 * HOW:  Calls GET /Dashboard/candles/weekly with either:
 *       - start + end (from the dashboard's date picker), or
 *       - weeks (26 desktop / 12 mobile) for the default view
 */
@Injectable({ providedIn: 'root' })
export class CandleService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Dashboard/candles/weekly`; // keep your env property name

  getWeeklyCandles(
    weeks: number,
    start?: string, // "yyyy-MM-dd"
    end?: string    // "yyyy-MM-dd"
  ): Observable<ProductSalesCandle[]> {
    let params = new HttpParams().set('weeks', weeks);

    if (start) params = params.set('start', start);
    if (end) params = params.set('end', end);

    return this.http.get<ProductSalesCandle[]>(this.baseUrl, { params });
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, tap, throwError} from 'rxjs';
import { Category } from '../../models/category';
import { CategorySale } from '../../models/categorySale';
import { API_URL } from '../../tokens/api-url.token';

@Injectable({
  providedIn: 'root'
})
export class StockCategoryService {
  private _http = inject(HttpClient)
  
url: string = inject(API_URL);
  
  constructor() { }

  getCategories(): Observable<Category[]> {
    var response = this._http.get<Category[]>(`${this.url}/Category/`)
      .pipe(
        tap(items => {
          //console.log(items, 'Categories')
        }),
        catchError(this.handleError),
      )

    return response
  }

  getSalesByCategory(categoryName:string, year:string): Observable<CategorySale[]> {
    var response = this._http.get<CategorySale[]>(`${this.url}/Category/${categoryName},${year}`)
      .pipe(
        tap(items => {
         // console.log(items, 'Categories')
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

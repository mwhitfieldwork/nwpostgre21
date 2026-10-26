import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * WHAT: A blueprint for services that GET data from our API.
 * WHY:  Every service was repeating the same steps: build the URL, call
 *       http.get, catch errors, and its own copy of handleError.
 * HOW:  <T> is the type of one item (ProductModel, EmployeeTerritoryMap...).
 *       "abstract" means you never use ApiService directly. A real service
 *       "extends" it, fills in T, and sets its path.
 *
 *   export class ProductsService extends ApiService<ProductModel> {
 *     protected path = '/Product';
 *   }
 */
export abstract class ApiService<T> {
  protected http = inject(HttpClient);
  protected baseUrl = environment.apiUrl;

  /** Each child service MUST set this, e.g. '/Product'. */
  protected abstract path: string;

  /** GET {apiUrl}{path} → a list of T */
  getAll(): Observable<T[]> {
    const url = `${this.baseUrl}${this.path}`;
   // console.log('ApiService getAll URL:', url);   // TEMP: remove after debugging
    return this.http.get<T[]>(url)
      .pipe(catchError(this.handleError));
  }

  /** GET {apiUrl}{path}/{id} → one T */
  getById(id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${this.path}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** Written once for every service. HttpErrorResponse is what Angular really sends. */
  protected handleError(error: HttpErrorResponse) {
    console.error(error);
    return throwError(() => error);
  }
}

//override marks that you’re replacing the parent’s version on purpose.
//super.getAll() calls the parent’s version.
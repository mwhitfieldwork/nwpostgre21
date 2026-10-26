import { Inject, inject, Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, take } from 'rxjs/operators'
import { ProductModel } from '../../../utilities/models/product';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../utilities/models/category';
import { ProductCreateModel } from '../../models/productNew';
import { CategorySale } from '../../models/categorySale';
import { ProductInvoice } from '../../models/productInvoice';
import { ApiService } from '../api/api.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends ApiService<ProductModel> {
private _http = inject(HttpClient);
protected path = '/api/Product';
/**
 * HOW THE PRODUCTS TABLE KNOWS TO RELOAD
 *
 * Think of a radio station:
 * - refreshSource is the MICROPHONE (a Subject). Only this service can talk into it.
 * - refresh$ is the RADIO (an Observable). Anyone can listen; nobody can talk into it.
 *
 * The products table listens to refresh$. Every time something is said
 * into the microphone, the table fetches the product list again.
 */
private refreshSource = new Subject<void>();      // the microphone (send signals)
refresh$ = this.refreshSource.asObservable();     // the radio (listen only)

  url:string = environment.apiUrl + '/api';
  noapiurl:string = environment.apiUrl;
  errorMessage:string = '';

  getProducts(): Observable<ProductModel[]> {
    return this.getAll().pipe(
      map(products => products.sort((a, b) => b.productId - a.productId))
    );
  }

  getCategories(): Observable<Category[]> {
    var response = this._http.get<Category[]>(`${this.url}/Category/`)
      .pipe(
        tap(items => {
          //this.nwDataChanged.next(items);
          // console.log(this.url)
        }),
        catchError(this.handleError),
      )

    return response
  }

  getProduct(productId: string): Observable<ProductModel> {
    return this.getById(productId)
  }


  createProduct(product: ProductCreateModel): Observable<ProductModel> {
    let url = `${this.url}/Product/AddProduct`;
    let newProduct = JSON.stringify(product)
    var response = this._http.post<ProductModel>(url, newProduct, httpOptions);
    // console.log(url);
    return response;
  }

  createProductInvoice(productIds: number[]): Observable<{ message: string }> {
    const url = `${this.noapiurl}/Invoice`;
    return this._http.post<{ message: string }>(url, { productIds });
  } 

  /**
   * WHAT: Saves an edited product.
   * WHY:  The API's PUT needs the WHOLE product, ID included (it checks the
   *       URL ID matches the body ID). It replies with NoContent, so nothing comes back.
   * HOW:  Send the full ProductModel; use its own productId for the URL.
   */
  updateProduct(product: ProductModel): Observable<void> {
    const url = `${this.url}/Product/${product.productId}`;
    return this._http.put<void>(url, product, httpOptions);
  }


  
  updateSalesDashboardProduct(product: ProductModel, productId:string): Observable<ProductModel> {
    let url = `${this.url}/Product/${productId}`;
    let newProduct = JSON.stringify(product)
    // console.log(url);
    var response = this._http.put<ProductModel>(url, newProduct, httpOptions);
    return response;
  }

  /**
   * Deletes one product on the API.
   *
   * ASYNC: the API answers later, so this returns an Observable
   * (a callback promise) instead of a result.
   * Nothing happens until the component SUBSCRIBES to it.
   *
   * tap() lets us do something extra when the answer arrives,
   * without changing the answer itself.
   * Here: once the delete succeeds, tell the table to reload.
   */
  deleteProduct(id: number): Observable<void> {
    const url = `${this.url}/Product/${id}`;
    return this._http.delete<void>(url).pipe(
      tap(() => this.notifyProductsChanged())   // delete worked, so reload the table
    );
  } 

  /**
   * Says "products changed!" into the microphone.
   * It sends no data, just the signal (that's what <void> means).
   * The table hears it and reloads its own list.
   */
  notifyProductsChanged() {
    this.refreshSource.next();
  }
}

import { Inject, inject, Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, take } from 'rxjs/operators'
import { ProductModel } from '../../../utilities/models/product';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../utilities/models/category';
import { ProductCreateModel } from '../../models/productNew';
import { CategorySale } from '../../models/categorySale';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
private _http = inject(HttpClient);
private refreshSource = new Subject<void>();
refresh$ = this.refreshSource.asObservable();

  url:string = environment.apiUrl + '/api';
  errorMessage:any;

  getProducts(): Observable<ProductModel[]> {
    var response = this._http.get<ProductModel[]>(`${this.url}/Product`)
      .pipe(
        map(products =>  products.sort((a, b) => b.productId - a.productId)), 
        tap(items => {
        }),
        catchError(this.handleError),
      )

    return response
  }

  getCategories(): Observable<Category[]> {
    var response = this._http.get<Category[]>(`${this.url}/Category/`)
      .pipe(
        tap(items => {
          //this.nwDataChanged.next(items);
          console.log(this.url)
        }),
        catchError(this.handleError),
      )

    return response
  }

  getProduct(productId: string): Observable<ProductModel> {
    let url = `${this.url}/Product/${productId}`;
    var response = this._http.get<ProductModel>(url)
      .pipe(
        tap(item => {
        }),
        catchError(this.handleError),
      )

    return response
  }


  createProduct(product: ProductCreateModel): Observable<ProductModel> {
    let url = `${this.url}/Product/AddProduct`;
    let newProduct = JSON.stringify(product)
    var response = this._http.post<ProductModel>(url, newProduct, httpOptions);
    console.log(url);
    return response;
  }

  updateProduct(product: ProductModel, productId:string): Observable<ProductModel> {
    let url = `${this.url}/Product/${productId}`;
    let newProduct = JSON.stringify(product)
    console.log(url);
    var response = this._http.put<ProductModel>(url, newProduct, httpOptions);
    return response;
  }


  
  updateSalesDashboardProduct(product: ProductModel, productId:string): Observable<ProductModel> {
    let url = `${this.url}/Product/${productId}`;
    let newProduct = JSON.stringify(product)
    console.log(url);
    var response = this._http.put<ProductModel>(url, newProduct, httpOptions);
    return response;
  }

  deleteProduct(id:number): void {
    let url = `${this.url}/Product/${id}`;
    var response = this._http.delete(url)
    .subscribe({
      next: data => {
          console.log( 'Delete successful');
      },
      error: error => {
          this.errorMessage = error.message;
          console.error('There was an error!', error);
      }
    });

  }

  notifyProductsChanged() {
    this.refreshSource.next();
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(() => error || 'Server error');
  }
}

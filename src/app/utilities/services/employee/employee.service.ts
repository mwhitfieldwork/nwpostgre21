import { inject, Injectable } from '@angular/core';
import { Employee } from '../../models/employee';
import { catchError, map, Observable, tap, throwError} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    //Authorization: 'my-auth-token'
  })
};
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private _http = inject(HttpClient)
  
  url:string = 'https://localhost:5001';
  errorMessage: string ='';

  constructor() { }

  get(): Observable<Employee[]> {
    return this._http.get<Employee[]>(`${this.url}/Employee/`)
    .pipe( 
      tap(items => {
        // console.log(this.url)
      }),
      catchError(this.handleError),
    )
  }

  addEmployee(employee: Employee): Observable<Employee> {
    let url = `${this.url}/Employee/AddEmployee`;
    let newEmployee = JSON.stringify(employee)
    return this._http.post<Employee>(url, newEmployee, httpOptions).pipe(
      catchError(error => {
        this.errorMessage = error.message;
        console.error('There was an error!!', error);
        throw error;
      })
    );
  }

  dropEmployee(id:number): void {
    let url = `${this.url}/Employee/${id}`;
    var response = this._http.delete(url)
    .subscribe({
      next: data => {
          // console.log( 'Delete successful');
      },
      error: error => {
          this.errorMessage = error.message;
          console.error('There was an error!!', error);
      }
    });
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(() => error || 'Server error');
  }
}

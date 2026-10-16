import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { EmployeeTerritoryMap } from '../../models/employee-territory-map';

@Injectable({
  providedIn: 'root'
})
export class EmployeeTerritoryMapService {
  private _http = inject(HttpClient);
  url: string = environment.apiUrl;

  constructor() { }

  getEmployeeTerritoryMap(): Observable<EmployeeTerritoryMap[]> {
    return this._http.get<EmployeeTerritoryMap[]>(`${this.url}/api/EmployeeTerritoryMap`)
      .pipe(
        tap(items => {
          // console.log(this.url, '--employee territory map');
        }),
        catchError(this.handleError),
      );
  }

  private handleError(error: Response) {
    console.error(error);
    return throwError(() => error || 'Server error');
  }
}
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { EmployeeTerritoryMap } from '../../models/employee-territory-map';

/**
 * WHAT: Loads the employee/territory map for the map page.
 * WHY:  It used to repeat the URL, http.get and error handling itself.
 * HOW:  extends ApiService<EmployeeTerritoryMap> gives us getAll() for free.
 *       We only say where the data lives (path).
 */
@Injectable({
  providedIn: 'root'
})
export class EmployeeTerritoryMapService extends ApiService<EmployeeTerritoryMap> {
  protected path = '/api/EmployeeTerritoryMap';

  /** Same name as before, so the component doesn't change. */
  getEmployeeTerritoryMap(): Observable<EmployeeTerritoryMap[]> {
    return this.getAll();
  }
}
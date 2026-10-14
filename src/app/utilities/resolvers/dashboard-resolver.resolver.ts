import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { OrderHistoryService } from '../services/orders/order-history.service';
import { OrderDetails } from '../../utilities/models/order-detail';

/**
 * The shape of what this resolver hands to the dashboard.
 * Each key is one piece of data loaded before the page opens.
 */
export interface DashboardData {
  dataFromService1: OrderDetails[];
}

/**
 * DashboardResolver
 *
 * WHAT: Loads the order history BEFORE the dashboard page opens.
 * WHY:  The dashboard shouldn't show up half-empty and then pop data in.
 *       The router waits for this to finish, then opens the page.
 * HOW:  The router calls resolve() automatically when someone goes to
 *       the dashboard route. The result lands in route.data['data'].
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardResolver implements Resolve<DashboardData> {
  private _orderHistoryService = inject(OrderHistoryService);

  resolve(): Observable<DashboardData> {
    // forkJoin runs several requests at the same time and waits until
    // ALL of them finish, then hands back one object with every result.
    // There's only one request today, but more can be added here later
    // (for example: salesTotals: this._dashService.getTotals()).
    return forkJoin({
      dataFromService1: this._orderHistoryService.get(),
    });
  }
}


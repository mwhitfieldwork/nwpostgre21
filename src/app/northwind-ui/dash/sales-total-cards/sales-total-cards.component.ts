import { Component, inject, Input, OnInit} from '@angular/core';
import { DashboardService } from '../../../utilities/services/dashboard/dashboard.service';
import { DashboardCard } from '../../../utilities/models/dashboard-card';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

@Component({
    selector: 'app-sales-total-cards',
    standalone: true,
    imports: [AsyncPipe, CurrencyPipe, DecimalPipe],
    templateUrl: './sales-total-cards.component.html',
    styleUrl: './sales-total-cards.component.scss'
})
export class SalesTotalCardsComponent  {
private _dashboardService = inject(DashboardService);

@Input() beginningDate:Date= new Date();
@Input() endingDate:Date= new Date();

cards$: Observable<DashboardCard[]> = this.loadCards();
isLoading:boolean = false;

ngOnChanges() {
  this.cards$ = this.loadCards();
}


  icons = ['archive', 'bag', 'cart', 'truck'];

private loadCards(): Observable<DashboardCard[]> {
    return this._dashboardService
      .getSalesByDateRange(this.beginningDate.toISOString(), this.endingDate.toISOString())
      .pipe(
        // If the range is empty, fall back to all sales and remember that we did
        switchMap(rows =>
          rows.length
            ? of({ rows, isFallback: false })
            : this._dashboardService.getAllSales().pipe(map(all => ({ rows: all, isFallback: true })))
        ),
        map(({ rows, isFallback }) => {
          const latestMonth = rows
            .map(r => r.orderDate.slice(0, 7))
            .reduce((max, m) => (m > max ? m : max), '');

          const monthRows = rows.filter(r => r.orderDate.startsWith(latestMonth));

          const byCountry = new Map<string, number>();
          rows.forEach(r => {
            const country = r.customerCountry ?? 'Unknown';
            byCountry.set(country, (byCountry.get(country) ?? 0) + r.lineTotal);
          });
          const [topCountry, topCountrySales] = [...byCountry.entries()]
            .sort((a, b) => b[1] - a[1])[0] ?? ['None', 0];

          const rangeLabel = 'All time';

          return [
            //{ title: 'New Orders', subtitle: latestMonth, value: new Set(monthRows.map(r => r.orderId)).size, isCurrency: false },
            { title: 'This Month', subtitle: latestMonth, value: monthRows.reduce((s, r) => s + r.lineTotal, 0), isCurrency: true },
            { title: 'Overall Sales', subtitle: rangeLabel, value: rows.reduce((s, r) => s + r.lineTotal, 0), isCurrency: true },
            { title: 'Top Country', subtitle: topCountry, value: topCountrySales, isCurrency: true },
          ];
        }),
        catchError(err => {
          console.error('Sales cards failed to load', err);
          return of([]);
        })
      );
    }

}

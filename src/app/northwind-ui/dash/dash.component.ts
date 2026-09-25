import { Component, computed, effect, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DonutChartComponent } from "./donut-chart/donut-chart.component";
import { OrderHistoryComponent } from "../order-history/order-history.component";
import { UserSessionService } from '../../utilities/services/user-session/user-session.service';
import { ActivatedRoute } from '@angular/router';
import { TooltipDirective } from '../../utilities/directives/tooltip/tooltip.directive';
import { CardBasicComponent } from '../../shared/card-basic/card-basic.component';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Drivers } from '../../utilities/models/drivers';
import { BarChartComponent } from "./bar-chart/bar-chart.component";
import { SalesTotalCardsComponent } from "./sales-total-cards/sales-total-cards.component";
import { DatePickerFilterComponent } from "../../shared/date-picker-filter/date-picker-filter.component";
import { DashboardService } from '../../utilities/services/dashboard/dashboard.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { SalesTotal } from '../../utilities/models/salesTotal';
import { MatCalendar } from '@angular/material/datepicker';
import { SalesOverview } from '../../utilities/models/sales-overview';


@Component({
    selector: 'app-dash',
    standalone: true,
    imports: [
    MatCardModule,
    DonutChartComponent,
    OrderHistoryComponent,
    TooltipDirective,
    CardBasicComponent,
    CurrencyPipe,
    BarChartComponent,
    SalesTotalCardsComponent,
    DatePickerFilterComponent,
    MatCalendar,
    DatePipe,
    AsyncPipe,
    DecimalPipe
],
    templateUrl: './dash.component.html',
    styleUrl: './dash.component.scss'
})
export class DashComponent implements OnInit {
  beginningDate:Date= new Date();
  endingDate: Date= new Date();
  max:Date = new Date(1998, 6, 7);
  min: Date = new Date(1996, 2, 15)
  
  totalOrders:number = 12873;
  averageOrderPrice:number = 5433.32;
  averageTicketPrice:number = 708.12;
  backpackAverage:number = 1234.09;
  averageSaleCost:number = 23468.09;
  basicCost:number = 1180.09;
  salesTotals: SalesTotal[] = [];
  welcomeName!:string;

  drivers: Drivers[] = [
    {id:1, name: 'Water', cost: 185.2},
    {id:2, name: 'Coal', cost: 41.3},
    {id:3, name: 'Gas', cost: 12.2},
  ]
  private  _userSessionService = inject(UserSessionService);
  private _dashService = inject(DashboardService)
  
  //the type for this property can only be one of the three 
  //specified union types
  currentStatus!: 'online' | 'offline'| 'unknown' 
  
  data: any;
  //isLoading = true;

  isLoading = signal(true);
  overview$: Observable<SalesOverview> = this.loadSalesOverview();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.isLoading.set(true);

    this.route.data.subscribe(resolved => {
      this.data = resolved['data'].dataFromService1;
      this.isLoading.set(false);
    });

    this.welcomeName = this._userSessionService.currentUser!.firstname;
  }

  onDateSelected(date: Date) {
  const beginningDate = new Date(date);
  beginningDate.setHours(0, 0, 0, 0);
  
  const endingDate = new Date(date);
  endingDate.setHours(23, 59, 59, 999);

  this.overview$ = this.loadSalesOverview();

  this.beginningDate = beginningDate;
  this.endingDate = endingDate;


    this._dashService.getSalesTotals(beginningDate.toISOString(), endingDate.toISOString())
    .subscribe({
        next: (salesTotals) => {
          this.salesTotals = salesTotals;
          console.log('parent got:', salesTotals)
        },
        error: (err) => console.error(err)
    })
  }

  loadSalesOverview(): Observable<SalesOverview>{
    return this._dashService
      .getSalesByDateRange(this.beginningDate.toISOString(), this.endingDate.toISOString())
      .pipe(
        switchMap(rows => rows.length ? of(rows) : this._dashService.getAllSales()),
        map(rows => {
          const months = rows.map(r => r.orderDate.slice(0, 7));
          const latestMonth = months.reduce((max, m) => (m > max ? m : max), '');
          const sinceDate = rows
            .map(r => r.orderDate.slice(0, 10))
            .reduce((min, d) => (d < min ? d : min), rows[0]?.orderDate.slice(0, 10) ?? '');

          // Add up units and sales per category
          const byCategory = new Map<string, { units: number; sales: number }>();
          rows.forEach(r => {
            const current = byCategory.get(r.categoryName) ?? { units: 0, sales: 0 };
            current.units += r.quantity;
            current.sales += r.lineTotal;
            byCategory.set(r.categoryName, current);
          });

          const topCategories = [...byCategory.entries()]
            .map(([name, t]) => ({ name, ...t }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);

          const overallSales =  rows
            .slice(0, 20)                    
            .map(r => r.unitPrice)           
            .reduce((sum, price) => sum + price, 0);  

          const topUnits = [...rows]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)


          return {
            total: rows.reduce((s, r) => s + r.lineTotal, 0),
            sinceDate,
            thisMonth: rows
              .filter(r => r.orderDate.startsWith(latestMonth))
              .reduce((s, r) => s + r.lineTotal, 0),
            topCategories,
            overallSales,
            topUnits
          };
        }),
        catchError(err => {
          console.error('Overview failed to load', err);
          return of({ total: 0, 
            sinceDate: '', 
            thisMonth: 0, 
            topCategories: [], 
            overallSales:0,
            topUnits:[] });
        })
      );
  }  

}


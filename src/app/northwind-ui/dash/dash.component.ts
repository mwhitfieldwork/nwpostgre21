import { Component, computed, effect, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DonutChartComponent } from "./donut-chart/donut-chart.component";
import { OrderHistoryComponent } from "../order-history/order-history.component";
import { UserSessionService } from '../../utilities/services/user-session/user-session.service';
import { ActivatedRoute } from '@angular/router';
import { TooltipDirective } from '../../utilities/directives/tooltip/tooltip.directive';
import { CardBasicComponent } from '../../shared/card-basic/card-basic.component';
import { CurrencyPipe } from '@angular/common';
import { Drivers } from '../../utilities/models/drivers';
import { BarChartComponent } from "./bar-chart/bar-chart.component";
import { SalesTotalCardsComponent } from "./sales-total-cards/sales-total-cards.component";
import { DatePickerFilterComponent } from "../../shared/date-picker-filter/date-picker-filter.component";
import { DashboardService } from '../../utilities/services/dashboard/dashboard.service';
import { map } from 'rxjs';
import { SalesTotal } from '../../utilities/models/salesTotal';
import { MatCalendar } from '@angular/material/datepicker';


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
    MatCalendar
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


  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.isLoading.set(true);

    this.route.data.subscribe(resolved => {
      this.data = resolved['data'].dataFromService1;
      this.isLoading.set(false);
    });

    //this.welcomeName = this._userSessionService.currentUser!.firstname;
  }

  onDateRangeSelected(date: Date) {
  // Beginning of day
  const beginningDate = new Date(date);
  beginningDate.setHours(0, 0, 0, 0);

  // End of day
  const endingDate = new Date(date);
  endingDate.setHours(23, 59, 59, 999);

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

}


import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DashboardService } from '../../../utilities/services/dashboard/dashboard.service';
import { SalesTotal } from '../../../utilities/models/salesTotal';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-sales-total-cards',
    standalone: true,
    imports: [CurrencyPipe],
    templateUrl: './sales-total-cards.component.html',
    styleUrl: './sales-total-cards.component.scss'
})
export class SalesTotalCardsComponent implements OnInit, OnChanges {
@Input() salesTotals: SalesTotal[] = [];
private _dashboardService = inject(DashboardService);

salesData:SalesTotal[] = [];
beginningDate = new Date('1996-07-12').toISOString();
endingDate   = new Date('1997-07-12').toISOString();
totalCardLabels = ['Total Orders', 'Average Order Goal', 'Backpack Total', 'Average Sale Cost'];

icons = [
  'archive',
  'bag',
  'cart',
  'truck'
];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['salesTotals'] && this.salesTotals.length === 0) {
      this.beginningDate = new Date('1996-07-12').toISOString();
      this.endingDate   = new Date('1997-07-12').toISOString();
      this.getSalesTotals();
    }
  }

ngOnInit() {
  this.getSalesTotals();
}

getSalesTotals(){
  this._dashboardService.getSalesTotals(this.beginningDate, this.endingDate).subscribe({
    next: (data) => {
      this.salesTotals = data;
    },
    error: (error) => {
    }
  });
}

}

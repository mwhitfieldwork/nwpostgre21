import { Component, inject, Input, OnInit, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartOptions, ChartType, Filler, LineController, LineElement, PointElement } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { DashboardService } from '../../../utilities/services/dashboard/dashboard.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
               LinearScale,LineController, LineElement, PointElement, Filler);

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [BaseChartDirective, AsyncPipe],
    templateUrl: './bar-chart.component.html',
    styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {

  @Input() beginningDate:Date= new Date(1996, 9, 10);
  @Input() endingDate:Date= new Date(1996,9,31);

  private _dashboardService = inject(DashboardService);

  private colors = [
    '#00A2FF', // cool blue
    '#2ecc71', // cool green
    '#673AB7', // cool purple (still cooler than yellow/orange)
    '#8e8e8e', // neutral gray
    '#dadd32', // yellow-green
    '#bfa939', // mustard yellow
    '#ff8c00', // warm orange
    '#FF0000'  // warm red
  ];


  //public weeklyChartData$: Observable<ChartData<'bar'>> = this.loadWeeklyChart();
  public weeklyChartData$: Observable<ChartData<'line'>> = this.loadWeeklyLine();

  // Runs whenever the parent passes in new dates
 ngOnChanges(changes: SimpleChanges): void {
  const dateChanged = changes['beginningDate'] || changes['endingDate'];
  const firstLoad = changes['beginningDate']?.firstChange || changes['endingDate']?.firstChange;

  if (dateChanged && !firstLoad) {
    this.weeklyChartData$ = this.loadWeeklyLine();
  }
}

  private loadWeeklyLine(): Observable<ChartData<'line'>> {
    return this._dashboardService
      .getSalesByDateRange(this.beginningDate.toISOString(), this.endingDate.toISOString())
      .pipe(
        switchMap(rows => rows.length ? of(rows) : this._dashboardService.getAllSales()),
        map(rows => {
          const totals = new Array(7).fill(0);

          rows.forEach(r => {
            // Shift Sun=0...Sat=6 to Mon=0...Sun=6
            const day = (new Date(r.orderDate).getDay() + 6) % 7;
            totals[day] += r.lineTotal;
          });

          return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Weekly Sales',
              data: totals.map(t => Math.round(t)),
              borderColor: '#673AB7',
              backgroundColor: 'rgba(103, 58, 183, 0.25)',
              fill: 'origin',
              tension: 0.4,
              pointRadius: 0
            }]
          };
        }),
        catchError(err => {
          console.error('Weekly line chart failed to load', err);
          return of({ labels: [], datasets: [] } as ChartData<'line'>);
        })
    );
  }
  
  public weeklyLineOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, beginAtZero: true }
    }
  };
}

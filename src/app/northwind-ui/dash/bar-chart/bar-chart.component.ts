import { Component, inject, Input, OnInit } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { DashboardService } from '../../../utilities/services/dashboard/dashboard.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [BaseChartDirective, AsyncPipe],
    templateUrl: './bar-chart.component.html',
    styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {

  @Input() beginningDate:Date= new Date();
  @Input() endingDate:Date= new Date();

  private _dashboardService = inject(DashboardService);
  private colors = ['#FF0000', '#00A2FF', '#dadd32', '#bfa939', '#673AB7', '#2ecc71', '#ff8c00', '#8e8e8e'];

  public weeklyChartData$: Observable<ChartData<'bar'>> = this.loadWeeklyChart();

  // Runs whenever the parent passes in new dates
  ngOnChanges() {
    this.weeklyChartData$ = this.loadWeeklyChart();
  }

  private loadWeeklyChart(): Observable<ChartData<'bar'>> {
    return this._dashboardService
      .getSalesByDateRange(this.beginningDate.toISOString(), this.endingDate.toISOString())
      .pipe(
        switchMap(rows => rows.length ? of(rows) : this._dashboardService.getAllSales()),
        map(rows => {
          const categories = [...new Set(rows.map(r => r.categoryName))].sort();

          const datasets = categories.map((category, i) => {
            const totals = new Array(7).fill(0);

            rows
              .filter(r => r.categoryName === category)
              .forEach(r => {
                // getDay() is Sun=0...Sat=6; this shifts it to Mon=0...Sun=6
                const day = (new Date(r.orderDate).getDay() + 6) % 7;
                totals[day] += r.lineTotal;
              });

            return {
              label: category,
              data: totals.map(t => Math.round(t)),
              backgroundColor: this.colors[i % this.colors.length],
            };
          });

          return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets,
          };
        }),
        catchError(err => {
          console.error('Weekly chart failed to load', err);
          return of({ labels: [], datasets: [] } as ChartData<'bar'>);
        })
        
      );
  }

    
  public weeklyChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
        grid: { display: false }
      },
      y: {
        stacked: true,
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };


  
  public monthlyAreaData = {
    labels: Array.from({ length: 10 }, (_, i) => `Jul ${i + 1}`),
    datasets: [
      {
        label: 'Monthly Trend',
        data: [
          20, 25, 22, 30, 28, 35, 40, 38, 45, 50,
          48, 55, 60, 58, 62, 65, 70, 68, 75, 80,
          78, 85, 90, 88, 95, 100, 98, 105, 110, 115, 120
        ],
        borderColor: '#673AB7',
        backgroundColor: 'rgba(103, 58, 183, 0.25)',
        fill: true,
        tension: 0.4
      }
    ]
  };
  
  public monthlyAreaOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false } }
    }
  };
  
}

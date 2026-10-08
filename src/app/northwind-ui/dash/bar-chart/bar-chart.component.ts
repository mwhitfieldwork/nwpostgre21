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
  public colors = [
  '#FF0000', // warmest red
  '#ff8c00', // warm orange
  '#bfa939', // mustard yellow
  '#dadd32', // yellow-green
  '#2ecc71', // cool green
  '#673AB7', // cool purple
  '#8e8e8e', // neutral gray
  '#00A2FF'  // coolest blue
  ];

  public stats = [
    { value: '5,689', label: 'New Orders', percent:69 },
    { value: '32,568', label: 'This Month', percent:24  },
    { value: '$23,464', label: 'Expected Profit', percent:33  },
    { value: '1,204', label: 'Overseas', percent:90  },
    { value: '87%', label: 'Local Revenue', percent:19  },
    { value: '$9,310', label: 'Top Performance', percent:22  },
  ];

  public sliding = false;
  private timerId?: ReturnType<typeof setInterval>;
  protected readonly Math = Math;

  public weeklyChartData$: Observable<ChartData<'bar'>> = this.loadWeeklyChart();

  ngOnInit() {
    this.startRotation(); // temporary — Step 3 replaces this
  }

  startRotation() {
    this.timerId = setInterval(() => (this.sliding = true), 4000);
  }

  onSlideDone(event: TransitionEvent) {
    // only react to the track's own slide, not animations on the cards inside it
    if (event.target !== event.currentTarget) return;

    this.sliding = false;
    this.stats.push(this.stats.shift()!); // move first card to the end
  }

  ngOnDestroy() {
    clearInterval(this.timerId); // stops the timer when you leave the page
  }


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
import { Component, Input, SimpleChanges, inject } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import {DashboardService} from '../../../utilities/services/dashboard/dashboard.service';
import type { Options, SeriesSplineOptions, XAxisOptions } from 'highcharts';

@Component({
  selector: 'app-line-chart',
  imports: [HighchartsChartComponent],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent {
@Input() beginningDate!: Date;
@Input() endingDate!: Date;

private readonly days = 60;
private _dashboardService = inject(DashboardService);
private plotLines: number[] = [];
private max: number = 0;

private readonly trend = Array.from({ length: this.days }, (_, i) =>
  Math.round(80 + 25 * Math.sin(i / 4))
);

private buildDateLabels(count: number): string[] {
  const today = new Date();

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);   // today, tomorrow, etc.
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
  });
}

private statusColor(value: number): string {
  if (value >= 100) return 'orange';   // critical
  if (value >= 85) return '#f5a623';   // warning
  return '#2e9e44';                    // normal (green)
}

// Event markers placed on the peaks and dips of the wave
private readonly events = [6, 19, 31, 44, 57].map(i => ({
  x: i,
  y: this.trend[i],
  color: this.statusColor(this.trend[i]),
  name: this.trend[i] >= 100 ? 'Critical spike' : 'Low point'
}));

ngOnChanges(changes: SimpleChanges): void {
  if ((changes['beginningDate'] || changes['endingDate']) && this.beginningDate && this.endingDate) {
    this.getSplineData();
  }
} 

getSplineData(){
  console.log('Sending dates:', this.beginningDate.toISOString(), this.endingDate.toISOString());
  this._dashboardService.getSalesByDateRange(this.beginningDate.toISOString(), this.endingDate.toISOString())
    .subscribe(rows => {
      this.plotLines = [...rows]
                      .sort(() => Math.random() - 0.5)  
                      .map(row => row.unitPrice) 
                      .filter(price => price <= 80)                     
                      .slice(0, 22) 

      this.plotLines = this.plotLines.length > 0
              ? this.plotLines
              : [0, 0, 63, 8, 55, 29, 71, 34, 12, 66, 47,
                23, 79, 38, 5, 58, 31, 74, 19, 50, 27, 80];

      this.trendOptions = {
        ...this.trendOptions,
        xAxis: {
          ...(this.trendOptions.xAxis as XAxisOptions),
          categories: this.buildDateLabels(this.plotLines.length)
        },        
        series: [{ ...(this.trendOptions.series![0] as SeriesSplineOptions), data: this.plotLines }]
      };                
      console.log('Updated plotLines  ---------:', this.plotLines);
  });
}


public trendOptions: Options = {
  chart: {
    type: 'spline',
    scrollablePlotArea: {
       minWidth: 1300, 
       scrollPositionX: 0 } 
  },
  title: { text: undefined },
  credits: { enabled: false },
  legend: { enabled: false },
  xAxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    crosshair: { 
      color: '#66a8ff',
      dashStyle: 'Dash',
      width: 1
    },
    labels: { 
        style: { 
          color: '#03101f',
          fontSize: '12px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif'
        },
    },    
    gridLineWidth: 0,
    plotLines: [
      { value: 0, color: '#66a8ff', width: 1, dashStyle: 'Dash', zIndex: 3 }
    ]
  },
  yAxis: {
    title: { 
      text: 'Value', 
      style: {
        color: '#121416',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif'
      }
    },
    //min:0,
    max: 80,
    tickInterval: 5,
    labels: { 
      format: '{value}',
        style: { 
          color: '#121416',
          fontSize: '12px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif'
        }
    },
    gridLineWidth: 0,
    plotLines: [
      { value: 50, color: '#ff5722',  width: 1.5, dashStyle: 'Dash', zIndex: 5 },
      { value: 0,  color: '#f5a623', width: 1.5, dashStyle: 'Dash',  zIndex: 5 }
    ],
    plotBands: [                                                 // 2. threshold zones
      { from: 0,   to: 25,  color: 'rgba(194, 178, 128, 0.18)' },
      { from: 25,  to: 50, color: 'rgba(102, 187, 106, 0.18)' },
      { from: 50, to: 80, color: 'rgba(239, 184, 175, 0.8)' }
    ]
  },
  tooltip: { shared: true },
  plotOptions: {
    spline:{
      lineWidth: 3,
      marker: { enabled: true, radius: 6, symbol: 'circle', lineWidth: 3, fillColor: '#fff',lineColor: '#fff' }
    },
  },
  series: [
    {
      type: 'spline',                                            // 1. primary trend line
      name: 'Trend',
      data: this.plotLines,
      color: '#0057b8',
      lineWidth: 3,
      marker: { lineColor: '#2ecc71'},
    },  
  ]
};
}

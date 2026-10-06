import { Component, Input } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options } from 'highcharts';

@Component({
  selector: 'app-line-chart',
  imports: [HighchartsChartComponent],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent {
@Input() beginningDate: Date = new Date();
@Input() endingDate: Date = new Date();

private readonly days = 60;

// Fake sine wave: swings between ~55 and ~105
private readonly trend = Array.from({ length: this.days }, (_, i) =>
  Math.round(80 + 25 * Math.sin(i / 4))
);

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

public trendOptions: Options = {
  chart: {
    type: 'spline',
    scrollablePlotArea: {
       minWidth: 1300, 
       scrollPositionX: 0 } 
  },
  title: { text: 'Daily Trend' },
  credits: { enabled: false },
  legend: { enabled: false },
  xAxis: {
    categories: Array.from({ length: this.days }, (_, i) => `Day ${i + 1}`), //replace with acutal dates if needed
    crosshair: { 
      color: '#66a8ff',
      dashStyle: 'Dash',
      width: 1
    },
    labels: { 
        style: { 
          color: '#66a8ff',
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
    min:60,
    max:110,
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
      { value: 100, color: '#ff5722',  width: 1.5, dashStyle: 'Dash', zIndex: 5 },
      { value: 85,  color: '#f5a623', width: 1.5, dashStyle: 'Dash',  zIndex: 5 }
    ],
    plotBands: [                                                 // 2. threshold zones
      { from: 60,   to: 85,  color: 'rgba(194, 178, 128, 0.18)' },
      { from: 85,  to: 100, color: 'rgba(102, 187, 106, 0.18)' },
      { from: 100, to: 130, color: 'rgba(239, 184, 175, 0.8)' }
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
      data: this.trend,
      color: '#0057b8',
      lineWidth: 3,
      marker: { lineColor: '#2ecc71'},
      /*zones: [                                                   // 5. status coloring
        { value: 85,  color: '#2e9e44' },
        { value: 100, color: '#f5a623' },
        { color: 'orange' }
      ]*/
    },
    {
      type: 'scatter', 
      color: '#60d394',                                          // 3. event markers
      data: this.events,
      marker: { radius: 4 },
      tooltip: { pointFormat: '<b>{point.name}</b><br/>Value: {point.y}' },
      zIndex: 5
    },
    {
      type: 'scatter', 
      color: '#e69f00',                                          // 3. event markers
      data: [this.events],
      marker: { radius: 4 },
      tooltip: { pointFormat: '<b>{point.name}</b><br/>Value: {point.y}' },
      zIndex: 5
    }    
  ]
};
}

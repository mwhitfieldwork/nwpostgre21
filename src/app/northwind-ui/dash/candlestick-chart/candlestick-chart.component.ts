import {
  Component, OnInit, OnChanges, AfterViewInit, OnDestroy,
  SimpleChanges, Input, ElementRef, ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';
import { CandleService } from '../../../utilities/services/d3/candle.service'; // adjust path
import { ProductsService } from '../../../utilities/services/product-table/products.service'; // adjust path
import { ProductSalesCandle } from '../../../utilities/models/product-sales-candle.model'; // adjust path
import { DateRange } from '../../../shared/date-picker-filter/date-picker-filter.component'; // adjust path (YOUR DateRange, not Material's)

/**
 * WHAT: D3 candlestick chart of weekly sales (all products combined).
 * WHY:  Shows how daily sales rose and fell within each week.
 *       Green = week closed higher than it opened, red = lower, gray = flat.
 * HOW:  - ngOnInit loads the default range (26 weeks desktop, 12 mobile)
 *       - The dashboard's date picker passes in dateRange (@Input);
 *         ngOnChanges reloads when it changes
 *       - drawChart() clears the container and redraws with D3
 *       - A ResizeObserver redraws when the container's width changes (responsive)
 */
@Component({
  selector: 'app-candlestick-chart',
  standalone: true,
  imports: [],
  templateUrl: './candlestick-chart.component.html',
  styleUrl: './candlestick-chart.component.scss'
})
export class CandlestickChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  // Range from the dashboard's date picker (null = use default weeks)
  @Input() dateRange: DateRange | null = null;

  // The div D3 draws into
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  candles: ProductSalesCandle[] = [];
  loading = false;
  hasLoaded = false; // true after the first response (used for the "no data" message)

  private resizeObserver?: ResizeObserver;
  private lastWidth = 0;

  constructor(private candleService: CandleService) {}

  ngOnInit(): void {
    this.loadCandles();
  }

  // Reload when the dashboard sends a new date range (ngOnInit handles the first load)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange'] && !changes['dateRange'].firstChange) {
      this.loadCandles();
    }
  }

  // Watch the container's width so the chart resizes with the page
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      const width = Math.floor(entries[0].contentRect.width);
      // Only redraw when the width actually changes
      if (width !== this.lastWidth) {
        this.lastWidth = width;
        this.drawChart();
      }
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  // Stop watching when the component is removed (prevents memory leaks)
  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  // Mobile gets fewer weeks so candles stay thick enough to see/tap
  private get defaultWeeks(): number {
    return window.innerWidth < 768 ? 12 : 26;
  }

  loadCandles(): void {
    // Convert the picker's Dates to "yyyy-MM-dd"; no range = API default
    const start = this.dateRange ? this.toApiDate(this.dateRange.beginningDate) : undefined;
    const end   = this.dateRange ? this.toApiDate(this.dateRange.endingDate)    : undefined;

    this.loading = true;
    this.candleService.getWeeklyCandles(this.defaultWeeks, start, end).subscribe({
      next: (candles) => {
        this.candles = candles;
        this.loading = false;
        this.hasLoaded = true;
        this.drawChart();
      },
      error: (err) => {
        this.loading = false;
        this.hasLoaded = true;
        console.error('Failed to load candles', err);
      }
    });
  }

  private drawChart(): void {
    const container = this.chartContainer.nativeElement;

    // Start fresh every time
    d3.select(container).selectAll('*').remove();
    if (this.candles.length === 0) return;

    // ---- Sizes ----
    const width = container.clientWidth;
    if (width === 0) return; // not visible yet
    const height = width < 600 ? 280 : 400;  // shorter on mobile
    const margin = { top: 20, right: 16, bottom: 40, left: 64 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // ---- SVG + inner drawing area ----
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // ---- Scales ----
    // X: one evenly spaced slot per week (side by side, no calendar gaps)
    const x = d3.scaleBand<string>()
      .domain(this.candles.map(c => c.weekStart))
      .range([0, innerWidth])
      .padding(0.3);

    // Y: $0 up to the highest high (nice() rounds the top to a clean number)
    const maxHigh = d3.max(this.candles, c => c.high) ?? 0;
    const y = d3.scaleLinear()
      .domain([0, maxHigh])
      .nice()
      .range([innerHeight, 0]);

    // ---- Axes ----
    const parseDate = d3.timeParse('%Y-%m-%d');
    const formatDate = d3.timeFormat('%b %d');

    // Show only as many date labels as fit (about one per 70px)
    const maxLabels = Math.max(1, Math.floor(innerWidth / 70));
    const step = Math.ceil(this.candles.length / maxLabels);
    const tickWeeks = this.candles
      .filter((_, i) => i % step === 0)
      .map(c => c.weekStart);

    chart.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x)
          .tickValues(tickWeeks)
          .tickFormat(d => formatDate(parseDate(d)!))
      )
      .selectAll('text')
      .attr('font-size', 11);

    chart.append('g')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickFormat(d => `$${d3.format(',.0f')(d as number)}`)
      )
      .selectAll('text')
      .attr('font-size', 11);

    // ---- Candles ----
    const colorFor = (c: ProductSalesCandle) =>
      c.close > c.open ? '#2e7d32' :  // up = green
      c.close < c.open ? '#c62828' :  // down = red
      '#757575';                      // flat = gray

    const candle = chart.selectAll('.candle')
      .data(this.candles)
      .enter()
      .append('g')
      .attr('class', 'candle');

    // Wick: thin line from low to high, through the middle of the slot
    candle.append('line')
      .attr('x1', c => x(c.weekStart)! + x.bandwidth() / 2)
      .attr('x2', c => x(c.weekStart)! + x.bandwidth() / 2)
      .attr('y1', c => y(c.high))
      .attr('y2', c => y(c.low))
      .attr('stroke', colorFor)
      .attr('stroke-width', 1.5);

    // Body: box from open to close (at least 1px tall so flat weeks still show)
    candle.append('rect')
      .attr('x', c => x(c.weekStart)!)
      .attr('y', c => y(Math.max(c.open, c.close)))
      .attr('width', x.bandwidth())
      .attr('height', c => Math.max(1, Math.abs(y(c.open) - y(c.close))))
      .attr('fill', colorFor);

    // Hover tooltip (browser's built-in title)
    const money = d3.format('$,.2f');
    candle.append('title')
      .text(c =>
        `Week of ${formatDate(parseDate(c.weekStart)!)}\n` +
        `Open: ${money(c.open)}\nHigh: ${money(c.high)}\n` +
        `Low: ${money(c.low)}\nClose: ${money(c.close)}`
      );
  }

  // Formats a Date as "yyyy-MM-dd" using the local date (avoids time zone shifts)
  private toApiDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
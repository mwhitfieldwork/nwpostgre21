// WHAT: Shape of one weekly candle returned by GET /Dashboard/candles
// WHY:  Gives TypeScript the exact fields so the chart code is type-safe
// HOW:  Matches ProductSalesCandleDto in the .NET API (camelCase in JSON)
export interface ProductSalesCandle {
  weekStart: string; // "yyyy-MM-dd" (Monday of the week)
  open: number;      // first day's sales
  high: number;      // best day's sales
  low: number;       // worst day's sales
  close: number;     // last day's sales
}
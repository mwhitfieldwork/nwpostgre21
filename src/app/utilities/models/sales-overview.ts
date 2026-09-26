import { SalesLine } from "./sales-line.model";

export interface CategoryTotal {
  name: string;
  units: number;
  sales: number;
}

export interface SalesOverview {
  total: number;
  sinceDate: string;
  thisMonth: number;
  topCategories: CategoryTotal[];
  overallSales:number;
  topUnits:SalesLine[];
}
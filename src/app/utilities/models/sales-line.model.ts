export interface SalesLine {
  orderId: number;
  orderDate: string; // comes back as "1998-05-06T00:00:00"
  customerId: string;
  customerName: string;
  customerCountry: string | null;
  categoryName: string;
  productName: string;
  shipperName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}
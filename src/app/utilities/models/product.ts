import { OrderDetails } from "./order-detail";

export interface ProductModel {
    categoryId: number;
    discontinued?: boolean;
    productName: string;
    quantityPerUnit?: string;
    reorderLevel?: number;
    supplierId?: number;
    unitPrice: number;
    unitsInStock?: number;
    unitsOnOrder?: number;
}
import { ProductModel } from "./product";

export interface ProductInvoice {
    userEmail:string;
    products: ProductModel[];
}
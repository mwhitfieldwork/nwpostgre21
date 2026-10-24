import { ProductModel } from './product';

/**
 * WHAT: The shape of a product we SEND when creating one.
 * WHY:  A new product has no productId yet, because the database gives it one.
 *       Before, this was a hand-copied list of fields that could drift
 *       out of sync with ProductModel.
 * HOW:  Omit<ProductModel, 'productId'> means "ProductModel, minus productId".
 *       Add a field to ProductModel and it shows up here automatically.
 */
export type ProductCreateModel = Omit<ProductModel, 'productId'>;
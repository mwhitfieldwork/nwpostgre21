import { Pipe, PipeTransform } from '@angular/core';
import { ProductModel } from '../../models/product';

/** The four possible results. A union type, so a typo like 'Lwo' is a build error. */
export type StockStatus = 'Out' | 'Reorder' | 'Low' | 'OK';

/**
 * WHAT: Turns a product's stock numbers into a simple status word.
 *         {{ product | stockStatus }}  →  'Out' | 'Reorder' | 'Low' | 'OK'
 * WHY:  "14 in stock" means nothing at a glance; "Low" does. Keeping the
 *       rules in ONE pipe means every page shows the same status.
 * HOW:  Angular calls transform() with the value on the LEFT of the |.
 *       It's a "pure" pipe (the default): Angular only re-runs it when
 *       the product it's given changes, so it's cheap.
 *         Out     → stock is 0
 *         Reorder → stock ≤ reorder level
 *         Low     → stock ≤ 2 × reorder level
 *         OK      → anything higher
 */
@Pipe({ name: 'stockStatus', standalone: true })
export class StockStatusPipe implements PipeTransform {
  transform(product: Pick<ProductModel, 'unitsInStock' | 'reorderLevel'>): StockStatus {
    const stock   = product.unitsInStock ?? 0;
    const reorder = product.reorderLevel ?? 0;

    if (stock <= 0)           return 'Out';
    if (stock <= reorder)     return 'Reorder';
    if (stock <= reorder * 2) return 'Low';
    return 'OK';
  }
}

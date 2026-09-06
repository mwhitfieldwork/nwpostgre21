import { Component, inject } from '@angular/core';
import { ProductsService } from '../../../utilities/services/product-table/products.service';
import { map } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
@Component({
  selector: 'app-product-summary',
  imports: [CommonModule],
  templateUrl: './product-summary.component.html',
  styleUrl: './product-summary.component.scss',
})
export class ProductSummaryComponent {
  private productsService = inject(ProductsService);

  constructor(private location: Location) {}

  /*
  No ngOnInit, no ngOnDestroy, no subscription variable — 
  the async pipe subscribes when the template renders and 
  unsubscribes automatically when the component is destroyed.
  Full explainintion - Evernote: feature-2635
  */

  summary$ = this.productsService.getProducts().pipe(
    map(products => ({
      total: products.length,
      avgPrice: products.reduce((sum, p) => sum + p.unitPrice, 0) / products.length,
      discontinuedCount: products.filter(p => p.discontinued).length
    }))
  );

  goBack() { this.location.back(); }
}

import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../../utilities/services/product-table/products.service';
import { map } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { BasicTableComponent, TableColumn } from '../../../shared/basic-table/basic-table.component';
import { Category } from '../../../utilities/models/category';

@Component({
  selector: 'app-product-summary',
  imports: [CommonModule, BasicTableComponent],
  templateUrl: './product-summary.component.html',
  styleUrl: './product-summary.component.scss',
})
export class ProductSummaryComponent implements OnInit {
  private productsService = inject(ProductsService);

  /** The rows for the shared table. Starts empty, filled in ngOnInit. */
  categories: Category[] = [];

  /**
   * Which columns to show. TableColumn<Category> means each columnDef
   * must be a real field of Category. Try a typo and the build fails.
   */
  categoryColumns: TableColumn<Category>[] = [
    { columnDef: 'categoryId',   header: 'ID' },
    { columnDef: 'categoryName', header: 'Category' },
  ];

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.productsService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }
    
  /*
  No ngOnInit, no ngOnDestroy, no subscription variable — 
  the async pipe subscribes when the template renders and 
  unsubscribes automatically when the component is destroyed.
  Full explainintion - Evernote: feature-2635
  

  summary$ = this.productsService.getProducts().pipe(
    map(products => ({
      total: products.length,
      avgPrice: products.reduce((sum, p) => sum + p.unitPrice, 0) / products.length,
      discontinuedCount: products.filter(p => p.discontinued).length
    }))
  );
  */

  goBack() { this.location.back(); }
}

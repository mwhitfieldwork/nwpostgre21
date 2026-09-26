import { Component, ElementRef, inject, input, OnInit } from '@angular/core';
import { Category } from '../../../utilities/models/category';
import { StockCategoryService } from '../../../utilities/services/category-stock/category-stock.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BaseChartDirective } from 'ng2-charts';
import { AsyncPipe, NgFor } from '@angular/common';
import { ChartData, ChartOptions, ChartType,
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
 } from 'chart.js'; 
import { combineLatest } from 'rxjs';
import { UserSessionService } from '../../../utilities/services/user-session/user-session.service';
import { Authentication } from '../../../utilities/models/authentication';
import { CategorySale } from '../../../utilities/models/categorySale';
import { ProductsService } from '../../../utilities/services/product-table/products.service';
 Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
    selector: 'app-donut-chart',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        MatTooltipModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        BaseChartDirective,
        AsyncPipe
    ],
    templateUrl: './donut-chart.component.html',
    styleUrl: './donut-chart.component.scss'
})
export class DonutChartComponent implements OnInit {

private _categoriesService = inject(StockCategoryService);
private _userSessionService = inject(UserSessionService);
private _productsService = inject(ProductsService);

rectWidth = 10;
max:number = 250;
maxHeight = 0;
dimensions!: DOMRect;
outerPadding= 50;
padding = 0;
bandwidth= 0;
bandwidthCoef = 0.4; //bandwidth coefficient, how wide each bar is
left = 80; right=80; bottom =30 ;top=15;
innerHeight!:number;
innerWidth!:number;


categories: Category[] = [];//sales by category
categoriesList!:Subscription;
categorySalesList!:Subscription;
categoryName:string = "";

categorySalesForm!: FormGroup;
categorySalesEditForm!:FormGroup;

data:number[] = [185,100, 50, 75, 200,125,80,65];
xlabels:string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
xFullLabels:string[] = [];
salesData: CategorySale[] = [];
ylabels:number[] =[0, 50, 100, this.max].reverse();
isEditable:boolean = false;
selectedProduct?:CategorySale;

isLoading:boolean = true;

//donutChartType: ChartType = 'doughnut';
donutChartType = 'doughnut' as const;
donutChartData: ChartData<'doughnut'> = {
  labels: [],
  datasets: [{
    label: 'CategoriesA',
    data: [1],
    backgroundColor: [
  "#FF0000", // red
  "#00A2FF", // cyan-blue (contrast to red)

  "#e3cc49", // green
  "#FF00AA", // magenta-pink (contrast to green)

  "#0000FF", // blue
  "#FFB300", // amber-orange (contrast to blue)

  "#FF6A00", // orange
  "#0066FF", // azure (contrast to orange)

  "#AA00FF", // violet
  "#278477"  // violet-deep
    ],
    borderWidth: 0,
    hoverBorderWidth: 0,
    borderColor: 'transparent',
    borderAlign: 'inner',
    hoverOffset: 32
  }]
};

donutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  elements: {
    arc: {
      borderWidth: 0,
      hoverBorderWidth: 0,
      borderColor: 'transparent'
    }
  },
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#1a1a2e',
        font: { size: 12 },
        padding: 16,
        boxWidth: 14,
        // optional: makes legend markers look less “boxed”
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: { enabled: true }
  }
};

constructor(private element:ElementRef, private fb: FormBuilder) {
  //console.log(this.element.nativeElement);
  this.categorySalesForm  = this.fb.group({
    category_name:[''],
    category_year:['']
  });

  this.categorySalesEditForm = this.fb.group({
      category_selections:[''],
      productName:[''],
      totalPurchase:['']
  })
}

ngOnInit() {
  this.loadCategories();
  this.watchCategoryFilters();
  this.watchProductSelection();
}

  get user$() {
    return this._userSessionService.user$;
  }

  editCategoriesGraphViewToggle(){
    this.isEditable = false
  }

  editCategoriesEditableToggle(){
    this.isEditable = true
  }

  loadCategories(): void {
    this._categoriesService.getCategories().subscribe(categories => {
      this.categories = categories;
      this.isLoading = false;
      this.categorySalesForm.patchValue({
        category_name: categories[0].categoryName,
        category_year: '2024'
      });
    });
  }

  watchCategoryFilters(): void {
    combineLatest([
      this.categorySalesForm.get('category_name')!.valueChanges,
      this.categorySalesForm.get('category_year')!.valueChanges
    ]).subscribe(([categoryName, year]) => {
      if (!categoryName || !year) return;
      this.loadSalesData(categoryName, year);
    });
  }

  watchProductSelection(): void {
    this.categorySalesEditForm.get('category_selections')?.valueChanges.subscribe(value => {
      this.selectedProduct = this.salesData.find(product => product.productId == value);
      if (this.selectedProduct) {
        this.categorySalesEditForm.patchValue({
          productName: this.selectedProduct.productName,
          totalPurchase: this.selectedProduct.totalPurchase
        });
      }
    });
  }


  loadSalesData(categoryName: string, year: string): void {
  this._categoriesService.getSalesByCategory(categoryName, year)
    .subscribe(sales => {
      this.salesData = sales;

      this.data = sales
        .map(x => Number(x.totalPurchase) * .025)
        .slice(0, 5);

      this.xlabels = sales
        .map(x => x.productName.length > 3
          ? x.productName
          : x.productName
        )
        .slice(0, 5);

      this.maxHeight = Math.max(...this.data);
      this.xFullLabels = sales.map(x => x.productName);

      this.displayData();
    });
  }

  displayData(): void {

    // Reassign the whole object so Angular detects the change
    this.donutChartData = {
      labels: [...this.xlabels],
      datasets: [{
        label: this.categoryName,
        data: [...this.data],
        backgroundColor: [
        "#FF0000", // red
        "#00A2FF", // cyan-blue (contrast to red)

        "#dadd32", // green
        "#bfa939", // magenta-pink (contrast to green)

        "#0000FF", // blue
        "#FFB300", // amber-orange (contrast to blue)

        "#FF6A00", // orange
        "#0066FF", // azure (contrast to orange)

        "#AA00FF", // violet
        "#348776" 
        ],
        borderWidth: 0,
        hoverBorderWidth: 0,
        borderColor: 'transparent',
        hoverOffset: 12
      }]
    };
  }


  update(categorySalesEditForm: FormGroup){

    const productId = this.selectedProduct?.productId;

    if (!productId) return;

      this._productsService.getProduct(productId.toString()).subscribe(fullProduct => {
        const updatedProduct = {
          ...fullProduct,
          productName: categorySalesEditForm.value.productName
        };
        console.log(productId, '--- Sales Update Update');

        this._productsService.updateSalesDashboardProduct(updatedProduct, productId.toString()).subscribe(product => {
          console.log(product);
          this.editCategoriesGraphViewToggle();
          this.loadSalesData(this.categorySalesForm.value.category_name, this.categorySalesForm.value.category_year);
        });   
      })
  }

ngOnDestroy(): void {
  if(this.categoriesList){
    this.categoriesList.unsubscribe();
  }
}

}

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
import { NgFor } from '@angular/common';
import { ChartData, ChartOptions, ChartType,
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
 } from 'chart.js'; 
import { combineLatest } from 'rxjs';
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
    NgFor
  ],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.scss'
})
export class DonutChartComponent implements OnInit {

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
private _categoriesService = inject(StockCategoryService);
categoriesList!:Subscription;
categorySalesList!:Subscription;
categoryName:string = "";


categorySalesForm!: FormGroup;
data:number[] = [185,100, 50, 75, 200,125,80,65];
xlabels:string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
xFullLabels:string[] = [];
ylabels:number[] =[0, 50, 100, this.max].reverse();

isLoading:boolean = true;

//donutChartType: ChartType = 'doughnut';
donutChartType = 'doughnut' as const;
donutChartData: ChartData<'doughnut'> = {
  labels: [],
  datasets: [{
    label: 'CategoriesA',
    data: [1],
    backgroundColor: [
      '#faf5ff', // violet-bg-from
      '#f1e1fb', // violet-bg-to
      '#ede9fe', // violet-lighter
      '#d8b4fe', // violet-light
      '#e6c9f5', // violet-border
      '#c4a2f3', // violet-border-alt
      '#a855f7', // violet
      '#6b21a8', // violet-dark
      '#581c87', // violet-darker
      '#4c1d95'  // violet-deep
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
}

ngOnInit() {

  // 1. Load categories from API
  this._categoriesService.getCategories().subscribe(categories => {
    this.categories = categories;
    this.isLoading = false;
    this.categorySalesForm.patchValue({
      category_name: categories[0].categoryName,
      category_year: '2024'
    });
  });

  // 2. Combine both form control value changes
  combineLatest([
    this.categorySalesForm.get('category_name')!.valueChanges,
    this.categorySalesForm.get('category_year')!.valueChanges
  ])
  .subscribe(([categoryName, year]) => {

    // Only run API when both fields have values
    if (!categoryName || !year) return;

    this._categoriesService.getSalesByCategory(categoryName, year)
      .subscribe(sales => {

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
        '#faf5ff', // violet-bg-from
        '#f1e1fb', // violet-bg-to
        '#ede9fe', // violet-lighter
        '#d8b4fe', // violet-light
        '#e6c9f5', // violet-border
        '#c4a2f3', // violet-border-alt
        '#a855f7', // violet
        '#6b21a8', // violet-dark
        '#581c87', // violet-darker
        '#4c1d95'  // violet-deep
      ],
      borderWidth: 0,
      hoverBorderWidth: 0,
      borderColor: 'transparent',
      hoverOffset: 12
    }]
  };
}


ngOnDestroy(): void {
  if(this.categoriesList){
    this.categoriesList.unsubscribe();
  }
}

}

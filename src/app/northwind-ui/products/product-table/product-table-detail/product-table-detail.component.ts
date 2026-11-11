import { AfterViewInit, Component, EventEmitter, inject, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductModel } from '../../../../utilities/models/product';
import { ProductsService }from '../../../../utilities/services/product-table/products.service';

import { Category } from '../../../../utilities/models/category';
import { fromEvent, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { CommonModule, Location } from '@angular/common';
import { StockCategoryService } from '../../../../utilities/services/category-stock/category-stock.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { notBlank, positiveNumber,reorderNotAboveStock } from '../../../../utilities/validators/custom.validator';

@Component({
    selector: 'app-product-table-detail',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        CommonModule
    ],
    templateUrl: './product-table-detail.component.html',
    styleUrl: './product-table-detail.component.scss'
})
export class ProductTableDetailComponent implements OnInit, OnDestroy {
  productForm!:FormGroup;
  errorMessage!:string;
  ratedProduct!:ProductModel;
  isEdit!:boolean;
  productId!:string;
  updateProduct!:ProductModel;
  categories!:Category[];
  categories$!:Observable<Category[]>;
  private _categoryService = inject(StockCategoryService)
  private destroy$ = new Subject<void>();

  @Output() closeDialog = new EventEmitter<boolean>();

  constructor(private fb:FormBuilder,
              private route:ActivatedRoute,
              private router:Router,
              private _productsService: ProductsService,
              private location: Location
            ) { }

  ngOnInit(): void {
    this.route.queryParams.
    pipe(map(params => params['isEdit']), 
    takeUntil(this.destroy$))
    .subscribe(isEdit => {
      this.isEdit = isEdit === 'true'; 
    });

    this.categories$ = this.getCategories();
    this.productForm = this.fb.group({
      productname:['', [Validators.required, notBlank()]],
      unitPrice:['', [Validators.required, positiveNumber()]],
      quantity:['', Validators.required],
      category:['', Validators.required],
      // When stock drops to this number, it's time to reorder. Can't be negative.
      reorderLevel: [0, [Validators.required, Validators.min(0)]],
      unitsInStock:['', [Validators.required, Validators.min(0)]],
      store: new FormGroup({
        branch: new FormControl(''),
        code: new FormControl('')
      })
    }, {
      // Rules that compare fields go on the GROUP, not on one field.
      validators: [reorderNotAboveStock()]
    });

    if(this.isEdit){
      this.callExistingProduct();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() { 
    this.location.back(); 
  }


  getCategories():Observable<Category[]>{
    return this._categoryService.getCategories().pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  update(productForm: FormGroup){
    var productUpdate = {...this.ratedProduct, 
      "productId": Number(this.productId),
      "productName": productForm.value.productname,
      "quantityPerUnit": productForm.value.quantity,
      "unitPrice": productForm.value.unitPrice,
      "unitsInStock": Number(productForm.value.unitsInStock),
      "reorderLevel": Number(productForm.value.reorderLevel),
      "categoryId": Number(productForm.value.category)}

    // console.log(productUpdate, '--- Produ Update');

    this._productsService.updateProduct(productUpdate).subscribe(product => {
      this._productsService.notifyProductsChanged();
      this.router.navigate(['/products']);
    })
  }

  create(payload:FormGroup){
    // console.log(payload.value);

    let newProduct = {
      categoryId: Number(payload.value.category),
      discontinued: false,
      productName: payload.value.productname,
      quantityPerUnit: payload.value.quantity,
      reorderLevel: Number(payload.value.reorderLevel),
      supplierId: 1,
      unitPrice: payload.value.unitPrice,
      unitsInStock: Number(payload.value.unitsInStock),
      unitsOnOrder: 0
    }
    // console.log(newProduct, '---- new PRODuct');
    this._productsService.createProduct(newProduct).subscribe(product => {
      this._productsService.notifyProductsChanged();
      this.router.navigate(['/products']);
    });
  }

  callExistingProduct(){
    this.productId = this.route.snapshot.paramMap.get('id') ?? '';
    //const prodId = '999' //force 500;

    this._productsService.getProduct(this.productId).subscribe(product => { 
      this.ratedProduct = product;
      this.productForm.get('productname')?.setValue(this.ratedProduct.productName)
      this.productForm.get('quantity')?.setValue(this.ratedProduct.quantityPerUnit);
      this.productForm.get('unitsInStock')?.setValue(this.ratedProduct.unitsInStock);
      this.productForm.get('unitPrice')?.setValue(this.ratedProduct.unitPrice);
      this.productForm.get('category')?.setValue(this.ratedProduct.categoryId);
      this.productForm.get('reorderLevel')?.setValue(this.ratedProduct.reorderLevel ?? 0);
    },
    error => this.errorMessage = error?.message ?? 'Failed to load product')
  }

  closeDialogBox(){
    //this.closeDialog.emit(false);
    this.router.navigate(['/products']);
  }
}


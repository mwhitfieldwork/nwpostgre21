import {AfterViewInit, Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductModel } from '../../../../utilities/models/product';
import { ProductsService }from '../../../../utilities/services/product-table/products.service';

import { Category } from '../../../../utilities/models/category';
import { fromEvent,Observable, throwError } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { StockCategoryService } from '../../../../utilities/services/category-stock/category-stock.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
export class ProductTableDetailComponent implements OnInit{
  productForm!:FormGroup;
  errorMessage!:string;
  ratedProduct!:ProductModel;
  isEdit!:boolean;
  productId!:string;
  updateProduct!:ProductModel;
  categories!:Category[];
  categories$!:Observable<Category[]>;
  private _categoryService = inject(StockCategoryService)

  @Output() closeDialog = new EventEmitter<boolean>();

  constructor(private fb:FormBuilder,
              private route:ActivatedRoute,
              private router:Router,
              private _productsService: ProductsService) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(pluck('isEdit')).subscribe(isEdit => {
      this.isEdit = isEdit === 'true'; 
    });

    console.log(this.isEdit, 'This be edit');

    this.categories$ = this.getCategories();
    this.productForm = this.fb.group({
      productname:['', Validators.required],
      unitPrice:['', Validators.required],
      quantity:['', Validators.required],
      category:['', Validators.required],
      store: new FormGroup({
        branch: new FormControl(''),
        code: new FormControl('')
      })
    })

    if(this.isEdit){
      this.callExistingProduct();
    }

    this.productForm.get('productname')?.valueChanges.subscribe( x => console.log(x));

  }


  getCategories():Observable<Category[]>{
    return this._categoryService.getCategories().pipe(
      catchError((error, caught) => {
        console.log(error);
        return throwError(error);
      })
    );
  }

  update(productForm: FormGroup){
    var productUpdate = {...this.updateProduct, "productId": this.productId,
      "productName": productForm.value.productname,
      "quantityPerUnit": productForm.value.quantity,
      "unitPrice": productForm.value.unitPrice,
      "CategoryId": productForm.value.category}

    this._productsService.updateProduct(productUpdate, this.productId).subscribe(product => {
      console.log(product);
      this.router.navigate(['/products']);
    })
  }

  create(payload:FormGroup){
    console.log(payload.value);

    let newProduct = {
      categoryId: 1,
      discontinued: false,
      productId: 0,
      productName: payload.value.productname,
      quantityPerUnit: payload.value.quantity,
      reorderLevel: 0,
      supplierId: 1,
      unitPrice: payload.value.unitPrice,
      unitsInStock: 0,
      unitsOnOrder: 0
    }

    this._productsService.createProduct(newProduct).subscribe(product => {
      console.log(product); 
      this.router.navigate(['/products']);
    });
  }

  callExistingProduct(){
    const prodId = this.route.snapshot.paramMap.get('id') ?? '';
    //const prodId = '999' //force 500;

    this._productsService.getProduct(prodId).subscribe(product => { 
      this.ratedProduct = product;
      this.productForm.get('productname')?.setValue(this.ratedProduct.productName)
      this.productForm.get('quantity')?.setValue(this.ratedProduct.quantityPerUnit);
      this.productForm.get('unitPrice')?.setValue(this.ratedProduct.unitPrice);
    },
    error => this.errorMessage = <any>error)
    
  }

  closeDialogBox(){
    //this.closeDialog.emit(false);
    this.router.navigate(['/products']);
  }
}
function ngAfterViewInit() {
  throw new Error('Function not implemented.');
}


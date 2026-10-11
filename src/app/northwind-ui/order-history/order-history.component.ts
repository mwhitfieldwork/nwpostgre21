import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { map, Subscription, tap } from 'rxjs';
import { OrderHistoryService } from '../../utilities/services/orders/order-history.service';
import { OrderDetails } from '../../utilities/models/order-detail';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { FormsModule } from '@angular/forms';
import { CustomNumberPipe } from '../../utilities/pipes/custom-number/custom-number.pipe';
import { CommonModule, DecimalPipe, NgClass } from '@angular/common';
import { RatingComponent } from '../../shared/rating/rating.component';
import { RowDisplayFactory } from '../../utilities/factories/row-display.factory';
import {AgGridAngular} from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        FormsModule,
        CustomNumberPipe,
        DecimalPipe,
        RatingComponent,
        NgClass,
        CommonModule,
        AgGridAngular,
    ],
    templateUrl: './order-history.component.html',
    styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent {

private _orderHistoryService = inject(OrderHistoryService)
orderList!:Subscription;
dataSource: MatTableDataSource<OrderDetails> = new MatTableDataSource();
selection = new SelectionModel<OrderDetails>(true, []);
orderHistory: OrderDetails[] = [];
defaultColDef: ColDef = { flex: 1 };

private rowFactory = inject(RowDisplayFactory);
private statuses = ['Shipped', 'Pending', 'Processing'];

colDefs: ColDef[] = [
  {field:'productName'},
  {field:'unitPrice'},
  {field:'quantity'},
  {field:'orderId'},
  {field:'status',
  cellClass: params => ['status-cell', 'status-' + params.value?.toLowerCase()] 
  }
];

  ngOnInit(){
    this.getOrderHisroty();
  }

  getOrderHisroty(){
     this._orderHistoryService.get().subscribe(rows => {
      this.orderHistory = this.rowFactory.createMany(rows, this.statuses);
      //console.log(this.orderHistory, '----------------history');
     })
  }

}

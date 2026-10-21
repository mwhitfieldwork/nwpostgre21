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
import type { RowSelectionOptions, SelectionChangedEvent } from 'ag-grid-community';
import {AgGridAngular} from 'ag-grid-angular';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

export type DeliveryStatus = 'on-time' | 'behind' | 'processing';

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
private rowFactory = inject(RowDisplayFactory);
private statuses = ['Shipped', 'Pending', 'Processing'];

orderList!:Subscription;
dataSource: MatTableDataSource<OrderDetails> = new MatTableDataSource();
selection = new SelectionModel<OrderDetails>(true, []);
orderHistory: OrderDetails[] = [];
searchText = '';

rowSelection: RowSelectionOptions = { mode: 'multiRow' };
selectedCount = 0;
selectedTotal = 0;

defaultColDef: ColDef = { 
  flex: 1,
  minWidth: 150,
  filter: true,
  floatingFilter: true  
};

gridTheme = themeQuartz.withParams({
  accentColor: '#5b2a9e',          // your purple: checkboxes, focus, selected rows
  headerBackgroundColor: '#5b2a9e',
  headerTextColor: '#ffffff',
  oddRowBackgroundColor: '#f8f5fc', // light purple stripe
  rowHoverColor: '#ede5f7',
  wrapperBorderRadius: 8,
});


colDefs: ColDef[] = [
  {field:'productName', pinned: 'left' , tooltipField: 'productName'},
  {field:'unitPrice',
  headerName: 'Unit Price',
  valueFormatter: params => params.value != null
    ? params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : ''
  },
  {
  headerName: 'Delivery',
  colId: 'delivery',
  valueGetter: (params): DeliveryStatus => {
    switch (params.data?.status) {
      case 'Shipped': return 'on-time';
      case 'Pending': return 'behind';
      default: return 'processing';
    }
  },
 cellRenderer: (params: ICellRendererParams<unknown, string>) =>
    `<span class="status-pill status-${params.value}">${params.value}</span>`
  }, 
  {field:'quantity'},
  {field:'orderId'},
  {field:'status',
  cellClass: params => ['status-cell', 'status-' + params.value?.toLowerCase()],
  },
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

  onSelectionChanged(event: SelectionChangedEvent) {
    const rows = event.api.getSelectedRows();
    this.selectedCount = rows.length;
    this.selectedTotal = rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);
  }

  exportCsv(grid: AgGridAngular) {
    grid.api.exportDataAsCsv({
      fileName: 'order-history.csv',
      onlySelected: this.selectedCount > 0
    });
  }  
}

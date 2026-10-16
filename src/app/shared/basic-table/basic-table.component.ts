import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-basic-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule
  ],
  templateUrl: './basic-table.component.html',
  styleUrl: './basic-table.component.scss',
  host: {
    class:"table-mat mat-elevation-z8", //adds these classes to the basic table wherever it is implemented
    '(click)': 'onRowClick($event)'
  }
})
export class BasicTableComponent  implements OnChanges, AfterViewInit {
  
  @Input() dataSource!: MatTableDataSource<any>;
  @Input() displayedColumns: { columnDef: string; header: string }[] = [];

  columnKeys: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(): void {
    // Update column keys whenever displayedColumns changes
    this.columnKeys = this.displayedColumns.map(column => column.columnDef);

    // Assign paginator and sort only if they are already available
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    // console.log('DataSource data: 1', this.dataSource)
  }

  ngAfterViewInit(): void {
    // Assign paginator and sort after view initialization
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // console.log('DataSource data:2', this.dataSource)
  }
  onRowClick($event:Event){
    // console.log($event, 'Row clicked');
  }

}

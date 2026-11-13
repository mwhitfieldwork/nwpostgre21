import { AfterViewInit, Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

/** One column: which field of T to show, and its header text. */
export interface TableColumn<T> {
  /** keyof T & string = must be a REAL field name of the row type. A typo is a build error. */
  columnDef: keyof T & string;
  header: string;
}

/**
 * WHAT: A reusable Material table (sorting + paging) for ANY kind of row.
 * WHY:  Build it once, use it on many pages, Storybook-style.
 * HOW:  - <T> is the row type, filled in by the page (Category, user, ...).
 *       - The page passes a plain array (rows) and the columns.
 *       - The table builds its own MatTableDataSource, so pages don't have to.
 */
@Component({
  selector: 'app-basic-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './basic-table.component.html',
  styleUrl: './basic-table.component.scss',
  host: { class: 'table-mat mat-elevation-z8' }
})
export class BasicTableComponent<T> implements OnChanges, AfterViewInit {
  /** The rows to show. A plain array, so pages stay simple. */
  @Input() rows: T[] = [];
  /** Which columns to show, in order. */
  @Input() columns: TableColumn<T>[] = [];

  /** Material's table needs a MatTableDataSource; the table makes it, not the page. */
  dataSource = new MatTableDataSource<T>([]);
  columnKeys: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /** Runs whenever the page hands us new rows or columns. */
  ngOnChanges(): void {
    this.dataSource.data = this.rows;
    this.columnKeys = this.columns.map(c => c.columnDef);
  }

  /** Paginator and sort only exist after the view is drawn. */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
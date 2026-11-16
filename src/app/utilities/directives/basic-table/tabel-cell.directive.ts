import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * WHAT: Marks an <ng-template> as "the custom look for column X."
 *         <ng-template appCell="admin" let-row> ... </ng-template>
 * WHY:  Lets a PAGE design its own cell (a pill, a button) while the
 *       shared table keeps doing sorting, paging and layout.
 * HOW:  - appCell="admin" → which column this template is for.
 *       - TemplateRef is the template itself; the table will "stamp" it into each row.
 *       - let-row → inside the template, `row` is that row's data.
 */
@Directive({ selector: '[appCell]', standalone: true })
export class TableCellDirective {
  @Input('appCell') column!: string;
  constructor(public template: TemplateRef<{ $implicit: unknown }>) {}
}
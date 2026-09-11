import { Component, EventEmitter, OnInit, Output, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

export interface DateRange {
    beginningDate: Date;
    endingDate: Date;
}

@Component({
    selector: 'app-date-picker-filter',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './date-picker-filter.component.html',
    styleUrl: './date-picker-filter.component.scss'
})
export class DatePickerFilterComponent implements OnInit {

  @Output() dateRangeSelected = new EventEmitter<DateRange>();
  
  maxDate: Date = new Date(1998, 5, 6); 
  minDate: Date = new Date(1996, 0, 1); 
  datePickerForm!: FormGroup;
  
  constructor(private fb: FormBuilder) {
  }


  ngOnInit() {
      this.datePickerForm = this.fb.group({
      beginningDate:new FormControl<Date | null>(null),
      endingDate:new FormControl<Date | null>(null),
      })
  }

  onApply() {
    const { beginningDate, endingDate } = this.datePickerForm.value;

    if (!beginningDate) {
      return;
    }

    if (!endingDate) {
      this.dateRangeSelected.emit({ beginningDate, endingDate: beginningDate });
      return;
    }

    if (this.datePickerForm.valid) {
      const dateRange: DateRange = {
        beginningDate: this.datePickerForm.value.beginningDate,
        endingDate: this.datePickerForm.value.endingDate
      };
      this.dateRangeSelected.emit(dateRange);
    }
 }
}

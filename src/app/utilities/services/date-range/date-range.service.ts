import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * WHAT: A shared "mailbox" that holds the currently selected date range.
 *
 * WHY:  The date picker now lives in the nav bar, and the charts live in the
 *       dashboard. They are separate components, so they can't pass the dates
 *       to each other directly. Both can inject this service, though.
 *
 * HOW:  The nav bar calls setRange() when the user picks dates.
 *       The dashboard subscribes to range$ and updates its charts.
 *       BehaviorSubject always remembers the latest value, so anyone who
 *       subscribes late still gets the current range right away.
 */
export interface DateRange {
  beginningDate: Date;
  endingDate: Date;
}

@Injectable({ providedIn: 'root' })   // one shared copy for the whole app
export class DateRangeService {

  // Starting range, the same defaults the dashboard uses now
  private rangeSubject = new BehaviorSubject<DateRange>({
    beginningDate: new Date(1996, 9, 10),
    endingDate: new Date(1996, 9, 31, 23, 59, 59, 999)
  });

  // Components subscribe to this to hear about new ranges
  public range$ = this.rangeSubject.asObservable();

  // The nav bar calls this when the user picks new dates
  setRange(beginningDate: Date, endingDate: Date): void {
    const end = new Date(endingDate);
    end.setHours(23, 59, 59, 999);   // include the whole last day

    this.rangeSubject.next({
      beginningDate: new Date(beginningDate),
      endingDate: end
    });
  }
}

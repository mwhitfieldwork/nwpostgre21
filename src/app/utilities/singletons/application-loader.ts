import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, distinctUntilChanged } from 'rxjs';

/**
 * WHAT: tells the yellow bar whether ANY API request is running.
 * WHY:  several requests can overlap; the bar should stay on until the LAST one finishes.
 * HOW:  count requests in/out. delay(0) passes the new value on just AFTER Angular
 *       finishes drawing, so it can't change mid-check (that caused NG0100).
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public isLoading$ = this.loadingSubject.pipe(
    distinctUntilChanged(), // only react when it actually flips on/off
    delay(0)                // wait until the current drawing pass is done
  );

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) this.loadingSubject.next(true);   // first one in → light on
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);      // never below 0
    if (this.activeRequests === 0) this.loadingSubject.next(false);  // last one out → light off
  }
}
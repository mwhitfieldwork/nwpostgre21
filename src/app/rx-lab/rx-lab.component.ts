import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { of, interval, Subscription } from 'rxjs';
import { StockCategoryService } from '../utilities/services/category-stock/category-stock.service';
/**
 * WHAT: a playground for seeing how observables deliver values.
 * WHY:  watching the console teaches more than reading about it.
 * HOW:  build a pipe, subscribe (turn the tap on), log everything that comes out.
 */
@Component({
  selector: 'app-rx-lab',
  standalone: true,
  template: `<h1>RxJS lab</h1><p>Open the Console (F12).</p>`,
})
export class RxLabComponent implements OnInit, OnDestroy  {

  constructor() {
  console.log('🟢 Lab created');
}

  // Keep a handle on the subscription so we can turn it off later
  private tickSub?: Subscription;
  private categoryService = inject(StockCategoryService);

  ngOnInit(): void {
    // Build the pipe. Nothing flows yet!
    const fruits$ = of('🍎 apple', '🍌 banana', '🍒 cherry');

    console.log('1. Pipe built, tap still OFF');

    // Turn the tap on. Three "handlers" for three kinds of events:
    fruits$.subscribe({
      next: (value) => console.log('2. Got a value:', value),   // runs once PER value
      error: (err) => console.log('Something broke:', err),     // runs if the pipe fails
      complete: () => console.log('3. Pipe finished, tap OFF'), // runs once at the end
    });

    console.log('4. Line after subscribe');

    // subscribe() RETURNS a Subscription, which is our "faucet handle"
    this.tickSub = interval(1000).subscribe({
     // next: (n) => console.log('⏱ tick', n),
    });

    this.categoryService.getCategories().subscribe({
      next: (cats) => console.log('🌐 HTTP value:', cats.length, 'categories'),
      complete: () => console.log('🌐 HTTP pipe finished, tap OFF by itself'),
    });
    console.log('6. Line after the HTTP subscribe');    
  }

  ngOnDestroy(): void {
    // Angular calls this when you leave the page, so turn the faucet off
    this.tickSub?.unsubscribe();
    console.log('🛑 Lab closed, ticks stopped');
  }  
  
}

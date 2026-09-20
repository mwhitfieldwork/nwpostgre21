import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class ToastsService {

  private snackbar = inject(MatSnackBar);

  show(message: string, type: 'success' | 'warning' = 'success'): Promise<boolean> {
    return new Promise(resolve => {
      try {
        // Example: using Angular Material Snackbar
        const ref = this.snackbar.open(message, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['grit-snackbar', `grit-snackbar-${type}`]
        });

        // Snackbar fires an event when it's fully opened
        ref.afterOpened().subscribe({
          next: () => resolve(true),
          error: () => resolve(false)
        });

      } catch {
        resolve(false);
      }
    });
  }
}

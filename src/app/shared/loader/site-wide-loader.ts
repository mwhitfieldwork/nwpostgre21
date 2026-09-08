// loading-spinner.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../utilities/singletons/application-loader';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading$ | async) {
      <div class="spinner-overlay">
        <div class="spinner"></div>
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 5px solid #ccc;
      border-top-color: #333;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  protected loadingService = inject(LoadingService);
}
// loading-spinner.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../utilities/singletons/application-loader';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template:`
    @if (loadingService.isLoading$ | async) {
      <div class="loading-bar-container">
        <div class="loading-bar"></div>
      </div>
    }
  `,
  styles: [`
    .loading-bar-container {
      position: fixed;
      top: 1px; /* match your header height */
      left: 0;
      right: 0;
      height: 3px;
      overflow: hidden;
      background: transparent;
      z-index: 9999;
    }
    .loading-bar {
      height: 100%;
      width: 0%;
      background: #b5ad3f;
      animation: loading-grow 1.5s ease-out forwards;
    }
    @keyframes loading-grow {
      0% { width: 0%; }
      80% { width: 90%; }
      100% { width: 90%; }
    }
  `]
})
export class LoadingSpinnerComponent {
  protected loadingService = inject(LoadingService);
}
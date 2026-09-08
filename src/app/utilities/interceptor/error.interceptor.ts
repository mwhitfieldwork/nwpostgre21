import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastsService } from '../services/toasts.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private router = inject(Router);
  private toast = inject(ToastsService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 404) {
          const shown = this.toast.show('Page not found');

          if (!shown) {
            this.router.navigate(['/404']);
          }
        }

        else if (error.status === 500) {
          const shown = this.toast.show('Internal server error');

          if (!shown) {
            this.router.navigate(['/500']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}


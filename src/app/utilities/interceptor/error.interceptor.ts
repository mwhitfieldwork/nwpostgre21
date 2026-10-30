import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastsService } from '../services/toasts.service';
import { LoginService } from '../services/login/login.service';

/**
 * WHAT: Catches every failed API request in ONE place and reacts to it.
 * WHY:  Without it, each service and component would need its own error code.
 *       It was a class; now it's a plain function like the other interceptors,
 *       so app.config.ts doesn't need a wrapper.
 * HOW:  next(req) sends the request on. catchError runs only if it fails.
 *       We show a toast (or go to an error page), then re-throw the error
 *       so the component that made the call still knows it failed.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastsService);
  const loginService = inject(LoginService); 

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = "your login isn't valid" (expired, edited or missing token).
      // Same exit as the expiry timer: clear the token and go to login.
      if (error.status === 401) {
        toast.show('Your session has ended. Please log in again.', 'warning');
        loginService.expireSession();
      }

      else if (error.status === 404) {
        const shown = toast.show('Page not found', 'warning');
        if (!shown) router.navigate(['/404']);
      }

      else if (error.status === 500) {
        const shown = toast.show('Internal server error', 'warning');
        if (!shown) router.navigate(['/500']);
      }

      return throwError(() => error);
    })
  );
};
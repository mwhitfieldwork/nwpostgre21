import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { ToastsService } from '../services/toasts.service';
import { SUCCESS_MESSAGES } from './success-messages.config';

export const successToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastsService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.ok) {
        const match = SUCCESS_MESSAGES.find(
          (entry) =>
            req.method === entry.method && req.url.includes(entry.url)
        );

        if (match) {
          toast.show(match.message);
        }
      }
    })
  );
};
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../services/login/login.service';
import { API_URL } from '../tokens/api-url.token';

/**
 * WHAT: Adds "Authorization: Bearer <token>" to calls to OUR API.
 * WHY:  The API checks that header on [Authorize] endpoints.
 * HOW:  Only for URLs that start with our API's address, so the JWT is
 *       never sent to Google Maps or other sites.
 *       inject(API_URL) runs inside the function, like inject(LoginService).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(LoginService).token;
  const apiUrl = inject(API_URL);

  // Only attach to your own API, not Google or other sites
  if (token && req.url.startsWith(apiUrl)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
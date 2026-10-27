import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

/**
 * This is a function, not a class - more of the Angular way
 * WHAT: A bouncer for private pages (dashboard, products, territories, admin).
 * WHY:  Without it, anyone can type /products in the address bar and walk in,
 *       even when logged out or with an expired token.
 * HOW:  Angular runs this BEFORE opening the page.
 *       - return true      → "come in"
 *       - return a UrlTree → "go here instead" (the login page)
 *       isTokenExpired() is also true when there's no token or it's broken,
 *       so one check covers every case.
 */
export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (!loginService.isTokenExpired()) {
    return true;
  }

  loginService.clearToken();         // tidy up a dead token, if there was one
  return router.createUrlTree(['']); // send them to login, instead of the navigate
};
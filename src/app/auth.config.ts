import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  redirectUri: window.location.origin + '/auth/callback',
  clientId: '819279068519-plqdbcnaucrbk0k6di0iqq97bv2cc902.apps.googleusercontent.com',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  disablePKCE: true,

  strictDiscoveryDocumentValidation: false,
  disableAtHashCheck: true,

  // Always show Google's "Choose an account" screen, even if you're
  // already signed in to Google, so you can switch accounts.
  customQueryParams: { prompt: 'select_account' },

  // Required for localhost
  requireHttps: false
};

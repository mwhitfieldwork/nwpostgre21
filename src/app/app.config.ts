import { ApplicationConfig, provideAppInitializer,inject, provideZoneChangeDetection, importProvidersFrom} from '@angular/core';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './utilities/interceptor/error.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { loadingInterceptor } from './utilities/interceptor/loader.interceptor';
import { successToastInterceptor } from './utilities/interceptor/success-toast.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHighcharts } from 'highcharts-angular';
import { authInterceptor } from './utilities/interceptor/auth.interceptor';
import { API_URL } from './utilities/tokens/api-url.token';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHighcharts(),
    provideNativeDateAdapter(),
    // The ONE place the API URL is chosen. Services ask for API_URL instead.
    { provide: API_URL, useValue: environment.apiUrl },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        authInterceptor,
        successToastInterceptor,
        errorInterceptor,
      ])
    ),
    
    importProvidersFrom(
      OAuthModule.forRoot({
        resourceServer: {
          allowedUrls: ['https://api.example.com'],
          sendAccessToken: true
        }
      })
    ),
    importProvidersFrom(MatSnackBarModule),
    provideAppInitializer(() => {
      const oauthService = inject(OAuthService);
      oauthService.configure(authConfig);
     return oauthService.loadDiscoveryDocument();
    }),
  ],
};

import { ApplicationConfig, provideAppInitializer,inject, provideZoneChangeDetection, importProvidersFrom} from '@angular/core';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorInterceptor } from './utilities/interceptor/error.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { loadingInterceptor } from './utilities/interceptor/loader.interceptor';
import { successToastInterceptor } from './utilities/interceptor/success-toast.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideNativeDateAdapter(),
provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        successToastInterceptor,
        (req, next) => {
          const interceptor = new ErrorInterceptor();
          return interceptor.intercept(req, { handle: next });
        }
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

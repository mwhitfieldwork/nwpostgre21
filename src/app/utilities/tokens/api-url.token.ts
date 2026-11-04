import { InjectionToken } from '@angular/core';

/**
 * WHAT: A label Angular uses to hand out the API's base URL.
 * WHY:  Services used to import environment directly. Now they just ask for
 *       API_URL, so a test can hand them a fake URL with no file changes.
 * HOW:  app.config.ts says what value goes with this label:
 *         { provide: API_URL, useValue: environment.apiUrl }
 *       Any service gets it with:
 *         private baseUrl = inject(API_URL);
 *       <string> means the value is a string. TypeScript checks that too.
 */
export const API_URL = new InjectionToken<string>('API_URL');
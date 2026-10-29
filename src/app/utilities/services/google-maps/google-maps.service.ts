import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
/**
 * WHAT: Loads Google's Maps script, once, only when a page needs it.
 * WHY:  main.ts used to make the WHOLE app wait for Maps before starting,
 *       even the login page. Now only the territory page waits.
 * HOW:  load() adds the <script> tag the first time and returns a Promise.
 *       Later calls get the SAME Promise back, so the script is never added twice.
 *       Google calls window.__nwMapsReady when it's fully ready (the callback= part).
 */
@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  private loading?: Promise<void>;

  load(): Promise<void> {
    // Already loading or loaded? Hand back the same promise.
    if (this.loading) return this.loading;

    this.loading = new Promise<void>((resolve, reject) => {
      // Google calls this function when Maps is ready to use.
      (window as unknown as Record<string, () => void>)['__nwMapsReady'] = () => resolve();

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&loading=async&callback=__nwMapsReady`;
      script.async = true;
      script.onerror = () => {
        this.loading = undefined; // allow a retry next time
        reject(new Error('Google Maps failed to load'));
      };
      document.head.appendChild(script);
    });

    return this.loading;
  }
}
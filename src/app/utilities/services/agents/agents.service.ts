import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private _http = inject(HttpClient);
  url: string = environment.apiUrl;

  ask(question: string): Observable<string> {
    return this._http.post(
      `${this.url}/api/Agent/ask`,
      { question },
      { responseType: 'text' }
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChatMessage } from '../../models/messages';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private _http = inject(HttpClient);
  url: string = environment.apiUrl;

ask(messages: ChatMessage[]) {
  return this._http.post(`${this.url}/api/Agent/ask`, { messages }, { responseType: 'text' });
}
}

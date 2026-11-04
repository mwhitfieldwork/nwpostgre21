import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../tokens/api-url.token';
import { ChatMessage } from '../../models/messages';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private _http = inject(HttpClient);
url: string = inject(API_URL);

ask(messages: ChatMessage[]) {
  return this._http.post(`${this.url}/api/Agent/ask`, { messages }, { responseType: 'text' });
}
}

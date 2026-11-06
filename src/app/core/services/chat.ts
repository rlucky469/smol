import { Injectable } from '@angular/core';
import { Api } from './api';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Chat {
  private baseUrl = environment.chatApiUrl;

  constructor(private apiService: Api) {}

  getAllChats(memberId: number, before: string | null, limit = 18) {
    return this.apiService.apiGet(
      `${this.baseUrl}sessions?limit=${limit}${before ? `&before=${encodeURIComponent(before)}` : ''}`
    );
  }

  deleteChat(chatId: string) {
    return this.apiService.apiDelete(`${this.baseUrl}sessions/${chatId}`, {});
  }
}

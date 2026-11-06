import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private baseUrl = environment.chatApiUrl;

  constructor(private api: Api) {}

  // ─Sessions

  createSession(title: string): Observable<{ id: string }> {
    return this.api.apiPost(`${this.baseUrl}sessions`, { title });
  }

  deleteSession(sessionId: string): Observable<void> {
    return this.api.apiDelete(`${this.baseUrl}sessions/${sessionId}`, {});
  }

  renameSession(sessionId: string, title: string): Observable<void> {
    return this.api.apiPatch(`${this.baseUrl}sessions/${sessionId}`, { title });
  }

  exportSession(sessionId: string, format: 'json' | 'txt' = 'json'): Observable<Blob> {
    return this.api.apiGetBlob(`${this.baseUrl}sessions/${sessionId}/export?format=${format}`);
  }

  // ─ Messages
  getMessages(sessionId: string, limit = 50, before?: string): Observable<any> {
    let url = `${this.baseUrl}sessions/${sessionId}/messages?limit=${limit}`;
    if (before) url += `&before=${encodeURIComponent(before)}`;
    return this.api.apiGet(url);
  }

  deleteMessage(sessionId: string, messageId: string): Observable<void> {
    return this.api.apiDelete(`${this.baseUrl}sessions/${sessionId}/messages/${messageId}`, {});
  }

  submitFeedback(
    sessionId: string,
    messageId: string,
    rating: 'up' | 'down',
    comment = ''
  ): Observable<void> {
    return this.api.apiPost(
      `${this.baseUrl}sessions/${sessionId}/messages/${messageId}/feedback`,
      { rating, comment }
    );
  }

  regenerate(sessionId: string): Observable<any> {
    return this.api.apiPost(`${this.baseUrl}sessions/${sessionId}/regenerate`, {});
  }

  //  Chat
  chat(externalUserId: string, sessionId: string, message: string): Observable<any> {
    return this.api.apiPost(`${this.baseUrl}chat`, {
      external_user_id: externalUserId,
      session_id: sessionId,
      message,
    });
  }

  getStreamBody(externalUserId: string, sessionId: string, message: string): object {
    return { external_user_id: externalUserId, session_id: sessionId, message };
  }

  getStreamUrl(): string {
    return `${this.baseUrl}chat/stream`;
  }
}

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';

import * as A from './conversation.actions';
import { ChatActions } from '../chat/chat.actions';
import { WalletActions } from '../wallet/wallet.actions';
import { chargeActions } from '../wallet/wallet.utils';
import { ConversationService } from '../../core/services/conversation';
import { Message } from './conversation.models';
import { selectMessages, selectNextBefore } from './conversation.selectors';
import { Toast } from '../../core/services/toast';

function toMsg(item: any): Message {
  return {
    id: item.id,
    role: (item.role as string).toLowerCase() as 'user' | 'assistant',
    content: item.content,
    sources: item.sources ?? null,
    created_at: item.created_at,
    feedbackRating: null,
  };
}

@Injectable()
export class ConversationEffects {
  private actions$ = inject(Actions);
  private svc = inject(ConversationService);
  private store = inject(Store);
  private router = inject(Router);
  private toast = inject(Toast);

  // Load messages
  loadConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadConversation),
      switchMap(({ sessionId }) =>
        this.svc.getMessages(sessionId, 50).pipe(
          map((res) =>
            A.loadConversationSuccess({
              messages: (res.items as any[]).map(toMsg),
              nextBefore: res.next_before ?? null,
            })
          ),
          catchError((error) => of(A.loadConversationFailure({ error })))
        )
      )
    )
  );

  // Load more (pagination)
  loadMore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadMoreMessages),
      withLatestFrom(this.store.select(selectNextBefore)),
      switchMap(([{ sessionId }, nextBefore]) =>
        this.svc.getMessages(sessionId, 50, nextBefore ?? undefined).pipe(
          map((res) =>
            A.loadMoreMessagesSuccess({
              messages: (res.items as any[]).map(toMsg),
              nextBefore: res.next_before ?? null,
            })
          ),
          catchError((error) => of(A.loadConversationFailure({ error })))
        )
      )
    )
  );

  //  Create session
  createConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.createConversation),
      switchMap(({ externalUserId, message }) =>
        this.svc.createSession(message.slice(0, 60)).pipe(
          mergeMap((session) => {
            const sessionId = session.id;
            return [
              A.setCurrentSession({ sessionId }),
              A.sendMessage({ externalUserId, sessionId, message }),
            ];
          }),
          catchError((error) => of(A.loadConversationFailure({ error })))
        )
      )
    )
  );

  redirectAfterCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(A.setCurrentSession),
        tap(({ sessionId }) => {
          if (!this.router.url.includes(sessionId)) {
            this.router.navigate(['/app', sessionId]);
          }
        })
      ),
    { dispatch: false }
  );

  //  Send message → show answer + bill the usage
  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.sendMessage),
      switchMap(({ externalUserId, sessionId, message }) =>
        this.svc.chat(externalUserId, sessionId, message).pipe(
          mergeMap((res) => {
            const assistantMsg: Message = {
              id: res.id,
              role: 'assistant',
              content: res.answer,
              sources: res.sources ?? null,
              created_at: new Date().toISOString(),
              feedbackRating: null,
            };
             return [
              A.streamDone({ assistantMsg }),
              ...chargeActions('Chat', message, res, res.id),
            ];
          }),
          catchError((error) => of(A.sendMessageFailure({ error })))
        )
      )
    )
  );

  // Regenerate → also billed
  regenerate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.regenerateResponse),
      withLatestFrom(this.store.select(selectMessages)),
      switchMap(([{ sessionId }, messages]) => {
        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
        return this.svc.regenerate(sessionId).pipe(
          mergeMap((res) => {
            const assistantMsg: Message = {
              id: res.id ?? crypto.randomUUID(),
              role: 'assistant',
              content: res.answer,
              sources: res.sources ?? null,
              created_at: new Date().toISOString(),
              feedbackRating: null,
            };
           return [
              A.regenerateSuccess({ assistantMsg }),
              ...chargeActions('Chat', lastUserMsg, res, res.id),
            ];
          }),
          catchError((error) => of(A.sendMessageFailure({ error })))
        );
      })
    )
  );


  deleteMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.deleteMessage),
      mergeMap(({ sessionId, messageId }) =>
        this.svc.deleteMessage(sessionId, messageId).pipe(
          map(() => {
            this.toast.success('Message deleted', 2000);
            return A.deleteMessageSuccess({ messageId });
          }),
          catchError(() => {
            this.toast.danger('Failed to delete message', 3000);
            return of(A.deleteMessageFailure({ messageId }));
          })
        )
      )
    )
  );

  // Feedback
  submitFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.submitFeedback),
      mergeMap(({ sessionId, messageId, rating, comment }) =>
        this.svc.submitFeedback(sessionId, messageId, rating, comment).pipe(
          map(() => {
            this.toast.success(
              rating === 'up' ? 'Thanks for the feedback!' : 'Feedback noted',
              2000
            );
            return A.submitFeedbackSuccess({ messageId, rating });
          }),
          catchError((error) => of(A.loadConversationFailure({ error })))
        )
      )
    )
  );

  // Rename session — sidebar title updates too
  renameSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.renameSession),
      mergeMap(({ sessionId, title }) =>
        this.svc.renameSession(sessionId, title).pipe(
          map(() => {
            this.toast.success('Chat renamed successfully', 2000);
            return ChatActions.updateChatTitle({ id: sessionId, title });
          }),
          catchError(() => {
            this.toast.danger('Failed to rename chat', 3000);
            return of(A.loadConversationFailure({ error: 'rename failed' }));
          })
        )
      )
    )
  );

  // Delete session
  deleteSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.deleteSession),
      map(({ sessionId }) => ChatActions.deleteChat({ chatId: sessionId }))
    )
  );

  // New session → add to sidebar
  addNewSessionToSidebar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.setCurrentSession),
      map(({ sessionId }) =>
        ChatActions.addNewSession({
          id: sessionId,
          title: 'New Chat',
          updated_at: new Date().toISOString(),
        })
      )
    )
  );

  // Export
  exportSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(A.exportSession),
        mergeMap(({ sessionId, format }) =>
          this.svc.exportSession(sessionId, format).pipe(
            tap((blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `chat-${sessionId}.${format}`;
              a.click();
              URL.revokeObjectURL(url);
              this.toast.success('Chat exported', 2000);
            }),
            catchError(() => {
              this.toast.danger('Export failed', 3000);
              return of(null);
            })
          )
        )
      ),
    { dispatch: false }
  );
}

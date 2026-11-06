import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map, of, tap } from 'rxjs';
import { ChatActions } from './chat.actions';
import { Router } from '@angular/router';
import { Chat } from '../../core/services/chat';
import { Toast } from '../../core/services/toast';

@Injectable()
export class ChatEffects {
  private actions$ = inject(Actions);
  private chatService = inject(Chat);
  private router = inject(Router);
  private toast = inject(Toast);

  // Load chats
  loadChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadChats),
      concatMap(({ memberId, before, limit }) =>
        this.chatService.getAllChats(memberId, before, limit).pipe(
          map((response) =>
            ChatActions.loadChatsSuccess({
              chats: response.items,
              hasMore: !!response.next_before,
              nextBefore: response.next_before ?? null,
            })
          ),
          catchError(() => of(ChatActions.loadChatsFailure()))
        )
      )
    )
  );

  // Delete chat
  deleteChat$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.deleteChat),
      exhaustMap(({ chatId }) =>
        this.chatService.deleteChat(chatId).pipe(
          map(() => ChatActions.deleteChatSuccess({ chatId })),
          catchError((error) => of(ChatActions.deleteChatFailure({ error })))
        )
      )
    )
  );

  // Delete success — toast + redirect 
  deleteChatSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.deleteChatSuccess),
        tap(({ chatId }) => {
  
          this.toast.success('Chat deleted successfully', 3000);
          const urlParts = this.router.url.split('/');
          const currentId = urlParts[urlParts.length - 1];
          if (chatId === currentId) {
            this.router.navigate(['/app']);
          }
        })
      ),
    { dispatch: false }
  );

  // Delete failure — toast
  deleteChatFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.deleteChatFailure),
        tap(() => this.toast.danger('Failed to delete chat', 3000))
      ),
    { dispatch: false }
  );
}
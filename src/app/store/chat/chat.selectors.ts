import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from './chat.model';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectAllChats = createSelector(selectChatState, (s) => s.chats);
export const selectLoading = createSelector(selectChatState, (s) => s.loading);
export const selectBefore = createSelector(selectChatState, (s) => s.before);
export const selectHasMore = createSelector(selectChatState, (s) => s.hasMore);
export const selectDeleteLoading = createSelector(selectChatState, (s) => s.deleteLoading);
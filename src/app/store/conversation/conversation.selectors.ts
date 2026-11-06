import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConversationState } from './conversation.models';

export const selectConversationState =
  createFeatureSelector<ConversationState>('conversation');

export const selectMessages = createSelector(
  selectConversationState,
  (s) => s.messages
);

export const selectConversationLoading = createSelector(
  selectConversationState,
  (s) => s.loading
);

export const selectIsConversationLoading = createSelector(
  selectConversationState,
  (s) => s.isConversationLoading
);

export const selectCurrentChatId = createSelector(
  selectConversationState,
  (s) => s.currentChatId
);

export const selectStreamingMessage = createSelector(
  selectConversationState,
  (s) => s.streamingMessage
);

export const selectHasMore = createSelector(
  selectConversationState,
  (s) => s.hasMore
);

export const selectNextBefore = createSelector(
  selectConversationState,
  (s) => s.nextBefore
);

export const selectIsNewSession = createSelector(
  selectConversationState,
  (s) => s.isNewSession
);
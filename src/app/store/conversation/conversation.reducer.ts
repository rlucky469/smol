import { createReducer, on } from '@ngrx/store';
import * as A from './conversation.actions';
import { ConversationState } from './conversation.models';

export const initialState: ConversationState = {
  currentChatId: null,
  messages: [],
  loading: false,
  error: null,
  isConversationLoading: false,
  streamingMessage: '',
  nextBefore: null,
  hasMore: false,
  isNewSession: false,
};

export const conversationReducer = createReducer(
  initialState,

  // Load sidebar 
  on(A.loadConversation, (state, { sessionId }) => ({
    ...state,
    loading: true,
    currentChatId: sessionId,
    messages: [],
    streamingMessage: '',
    isNewSession: false,
  })),

  on(A.loadConversationSuccess, (state, { messages, nextBefore }) => ({
    ...state,
    loading: false,
    messages,
    nextBefore,
    hasMore: !!nextBefore,
  })),

  on(A.loadConversationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load more
  on(A.loadMoreMessagesSuccess, (state, { messages, nextBefore }) => ({
    ...state,
    messages: [...messages, ...state.messages],
    nextBefore,
    hasMore: !!nextBefore,
  })),

  // setCurrentSession 
  on(A.setCurrentSession, (state, { sessionId }) => ({
    ...state,
    currentChatId: sessionId,
    isNewSession: true,  
  })),

  // Optimistic user message
  on(A.addOptimisticUserMessage, (state, { msg }) => ({
    ...state,
    messages: [...state.messages, msg],
    isConversationLoading: true,
    streamingMessage: '',
  })),

  // Streaming 
  on(A.streamChunk, (state, { chunk }) => ({
    ...state,
    streamingMessage: state.streamingMessage + chunk,
  })),

  on(A.streamDone, (state, { assistantMsg }) => ({
    ...state,
    messages: [...state.messages, assistantMsg],
    isConversationLoading: false,
    streamingMessage: '',
    isNewSession: false, 
  })),

  on(A.sendMessageFailure, (state) => ({
    ...state,
    isConversationLoading: false,
    streamingMessage: '',
  })),

  // Regenerate
  on(A.regenerateResponse, (state) => ({
    ...state,
    messages: state.messages.slice(0, -1),
    isConversationLoading: true,
    streamingMessage: '',
  })),

  on(A.regenerateSuccess, (state, { assistantMsg }) => ({
    ...state,
    messages: [...state.messages, assistantMsg],
    isConversationLoading: false,
  })),

  // Delete message 
  on(A.deleteMessage, (state, { messageId }) => ({
    ...state,
    messages: state.messages.map((m) =>
      m.id === messageId ? { ...m, isDeleting: true } : m
    ),
  })),

  on(A.deleteMessageSuccess, (state, { messageId }) => ({
    ...state,
    messages: state.messages.filter((m) => m.id !== messageId),
  })),

  on(A.deleteMessageFailure, (state, { messageId }) => ({
    ...state,

    messages: state.messages.map((m) =>
      m.id === messageId ? { ...m, isDeleting: false } : m
    ),
  })),

  // Feedback
  on(A.submitFeedbackSuccess, (state, { messageId, rating }) => ({
    ...state,
    messages: state.messages.map((m) =>
      m.id === messageId ? { ...m, feedbackRating: rating } : m
    ),
  })),

  //  Clear 
  on(A.clearConversation, () => initialState),
);
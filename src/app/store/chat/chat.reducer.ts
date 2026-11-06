import { createReducer, on } from '@ngrx/store';
import { ChatState } from './chat.model';
import { ChatActions } from './chat.actions';

const initialState: ChatState = {
  chats: [],
  loading: false,
  before: null,
  hasMore: true,
  deleteLoading: false,
};

export const chatReducer = createReducer(
  initialState,

  //  Load 
  on(ChatActions.loadChats, (state) => ({ ...state, loading: true })),

  on(ChatActions.loadChatsSuccess, (state, { chats, hasMore, nextBefore }) => ({
    ...state,
    loading: false,
    // Duplicate IDs merge
    chats: [
      ...new Map(
        [...state.chats, ...chats].map((c) => [c.id, c])
      ).values(),
    ],
    before: nextBefore,
    hasMore,
  })),

  on(ChatActions.loadChatsFailure, (state) => ({ ...state, loading: false })),

  // Add New Session 
  on(ChatActions.addNewSession, (state, { id, title, updated_at }) => ({
    ...state,
    chats: [{ id, title, updated_at }, ...state.chats.filter((c) => c.id !== id)],
  })),

  // Title rename 
  on(ChatActions.updateChatTitle, (state, { id, title }) => ({
    ...state,
    chats: state.chats.map((c) => (c.id === id ? { ...c, title } : c)),
  })),

  // Delete
  on(ChatActions.deleteChat, (state) => ({ ...state, deleteLoading: true })),

  on(ChatActions.deleteChatSuccess, (state, { chatId }) => ({
    ...state,
    deleteLoading: false,
    chats: state.chats.filter((c) => c.id !== chatId),
  })),

  on(ChatActions.deleteChatFailure, (state, { error }) => ({
    ...state,
    deleteLoading: false,
  })),
);
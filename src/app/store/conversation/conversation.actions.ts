import { createAction, props } from '@ngrx/store';
import { Message } from './conversation.models';

// Load messages 
export const loadConversation = createAction(
  '[Conversation] Load',
  props<{ sessionId: string }>()
);

export const loadConversationSuccess = createAction(
  '[Conversation] Load Success',
  props<{ messages: Message[]; nextBefore: string | null }>()
);
export const loadConversationFailure = createAction(
  '[Conversation] Load Failure',
  props<{ error: any }>()
);

// Load older messages (pagination)
export const loadMoreMessages = createAction(
  '[Conversation] Load More',
  props<{ sessionId: string }>()
);
export const loadMoreMessagesSuccess = createAction(
  '[Conversation] Load More Success',
  props<{ messages: Message[]; nextBefore: string | null }>()
);

//  Create session
export const createConversation = createAction(
  '[Conversation] Create',
  props<{ externalUserId: string; message: string }>()
);

//  Send message 
export const sendMessage = createAction(
  '[Conversation] Send Message',
  props<{ externalUserId: string; sessionId: string; message: string }>()
);
export const streamChunk = createAction(
  '[Conversation] Stream Chunk',
  props<{ chunk: string }>()
);
export const streamDone = createAction(
  '[Conversation] Stream Done',
  props<{ assistantMsg: Message }>()
);
export const sendMessageFailure = createAction(
  '[Conversation] Send Message Failure',
  props<{ error: any }>()
);


// Optimistic user message
export const addOptimisticUserMessage = createAction(
  '[Conversation] Add Optimistic User Msg',
  props<{ msg: Message }>()
);

// Regenerate
export const regenerateResponse = createAction(
  '[Conversation] Regenerate',
  props<{ sessionId: string }>()
);
export const regenerateSuccess = createAction(
  '[Conversation] Regenerate Success',
  props<{ assistantMsg: Message }>()
);

//Delete message
export const deleteMessage = createAction(
  '[Conversation] Delete Message',
  props<{ sessionId: string; messageId: string }>()
);
export const deleteMessageSuccess = createAction(
  '[Conversation] Delete Message Success',
  props<{ messageId: string }>()
);
export const deleteMessageFailure = createAction(
  '[Conversation] Delete Message Failure',
  props<{ messageId: string }>()
);

// Feedback
export const submitFeedback = createAction(
  '[Conversation] Submit Feedback',
  props<{ sessionId: string; messageId: string; rating: 'up' | 'down'; comment?: string }>()
);
export const submitFeedbackSuccess = createAction(
  '[Conversation] Submit Feedback Success',
  props<{ messageId: string; rating: 'up' | 'down' }>()
);

export const renameSession = createAction(
  '[Conversation] Rename Session',
  props<{ sessionId: string; title: string }>()
);
export const deleteSession = createAction(
  '[Conversation] Delete Session',
  props<{ sessionId: string }>()
);
export const exportSession = createAction(
  '[Conversation] Export Session',
  props<{ sessionId: string; format: 'json' | 'txt' }>()
);

// Reset
export const clearConversation = createAction('[Conversation] Clear');


export const setCurrentSession = createAction(
  '[Conversation] Set Current Session',
  props<{ sessionId: string }>()
);
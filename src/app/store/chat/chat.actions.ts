import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Chat } from './chat.model';

export const ChatActions = createActionGroup({
  source: 'Chat',
  events: {
    // Load
    'Load Chats': props<{ memberId: number; before: string | null; limit: number }>(),
    'Load Chats Success': props<{ chats: Chat[]; hasMore: boolean; nextBefore: string | null }>(),
    'Load Chats Failure': emptyProps(),

    
    'Add New Session': props<{ id: string; title: string; updated_at: string }>(),


    'Update Chat Title': props<{ id: string; title: string }>(),

    //  Delete
    'Delete Chat': props<{ chatId: string }>(),
    'Delete Chat Success': props<{ chatId: string }>(),
    'Delete Chat Failure': props<{ error: any }>(),
  },
});
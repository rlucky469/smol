export interface MessageSource {
  heading: string;
  title: string;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: MessageSource[] | null;
  created_at: string;

  htmlContent?: any;
  isStreaming?: boolean;
  feedbackRating?: 'up' | 'down' | null;
  isDeleting?: boolean; 
}

export interface ConversationState {
  currentChatId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isConversationLoading: boolean;
  streamingMessage: string;
  nextBefore: string | null;
  hasMore: boolean;
  isNewSession: boolean; 
}
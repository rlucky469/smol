export interface Chat {
  id: string;      
  title: string;
  updated_at: string;
}
 
export interface ChatState {
  chats: Chat[];
  loading: boolean;
  before: string | null;
  hasMore: boolean;
  deleteLoading: boolean;
}
 

// Update conversation types
export interface ConversationWithDetails {
  id: string;
  title: string;
  listing_id?: string;
  listing_type?: string;
  status: string;
  created_at: string;
  last_message_at: string;
  participants: {
    user_id: string;
    name: string;
    avatar_url?: string;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  };
  otherParticipant?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

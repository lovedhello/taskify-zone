import { supabase } from '@/integrations/supabase/client';
import type { Conversation, ConversationWithDetails, MessageWithSender, Message } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Json } from '@supabase/supabase-js';

export const chatService = {
  // Create a new conversation or retrieve an existing one
  async getOrCreateConversation(
    user_id_1: string,
    user_id_2: string,
    listingId?: string,
    listingType?: 'food_experience' | 'stay',
    title?: string
  ): Promise<{ conversationId: string; isNew: boolean }> {
    try {
      // Check if a conversation already exists between the two users for the listing
      let { data: existingConversation, error: selectError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id_1', user_id_1)
        .eq('user_id_2', user_id_2)
        .eq('listing_id', listingId)
        .eq('listing_type', listingType)
        .single();

      if (selectError && selectError.message.includes('No rows found')) {
        existingConversation = null;
      } else if (selectError) {
        console.error('Error checking for existing conversation:', selectError);
        throw selectError;
      }

      if (existingConversation) {
        // Conversation exists, return its ID
        return { conversationId: existingConversation.id, isNew: false };
      } else {
        // No conversation exists, create a new one
        const newConversationId = uuidv4();
        const { error: insertError } = await supabase
          .from('conversations')
          .insert([
            {
              id: newConversationId,
              user_id_1: user_id_1,
              user_id_2: user_id_2,
              listing_id: listingId,
              listing_type: listingType,
              title: title,
              last_message_at: new Date().toISOString(),
              status: 'active',
            },
          ]);

        if (insertError) {
          console.error('Error creating new conversation:', insertError);
          throw insertError;
        }

        return { conversationId: newConversationId, isNew: true };
      }
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  },

  // Fetch a single conversation by ID
  async getConversation(conversationId: string): Promise<ConversationWithDetails | null> {
    try {
      const { data, error } = await supabase.rpc('get_conversation_by_id', {
        conversation_id_param: conversationId
      });
      
      if (error) throw error;
      if (!data) return null;
      
      // Type cast the data properly
      return data as unknown as ConversationWithDetails;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  },

  // Fetch all conversations for a user
  async getUserConversations(): Promise<ConversationWithDetails[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return [];
      
      const { data, error } = await supabase.rpc('get_user_conversations_with_details', {
        user_id_param: session.session.user.id
      });
      
      if (error) throw error;
      if (!data) return [];
      
      // Make sure we handle length check properly, assuming data is an array
      const conversations = data as any[];
      console.log(`Fetched ${conversations.length} conversations`);
      
      // Type cast the data properly
      return conversations as unknown as ConversationWithDetails[];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  },

  // Send a new message in a conversation
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<MessageWithSender | null> {
    try {
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            content: content,
          },
        ])
        .select('*')
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw messageError;
      }

      // Fetch sender info
      const { data: sender, error: senderError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', senderId)
        .single();

      if (senderError) {
        console.error('Error fetching sender info:', senderError);
      }

      // Update last_message_at in conversations table
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating last_message_at:', updateError);
      }

      return {
        ...message,
        sender: sender || { id: senderId }, // Provide basic sender info even if profile fetch fails
        isCurrentUser: true, // Assuming the sender is the current user
      } as MessageWithSender;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  },

  // Fetch initial messages for a conversation
  async getInitialMessages(conversationId: string, limit: number = 20): Promise<MessageWithSender[]> {
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, name, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (messagesError) {
        console.error('Error fetching initial messages:', messagesError);
        throw messagesError;
      }

      const messagesWithSender: MessageWithSender[] = messages.map((message) => ({
        ...message,
        sender: message.sender || { id: message.sender_id }, // Provide basic sender info even if profile fetch fails
        isCurrentUser: message.sender_id === supabase.auth.user()?.id, // Determine if the message was sent by the current user
      }));

      return messagesWithSender;
    } catch (error) {
      console.error('Error in getInitialMessages:', error);
      return [];
    }
  },

  // Fetch older messages for pagination
  async getOlderMessages(conversationId: string, lastMessageId: number, limit: number = 20): Promise<MessageWithSender[]> {
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*, sender:profiles(id, name, avatar_url)')
        .eq('conversation_id', conversationId)
        .lt('id', lastMessageId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (messagesError) {
        console.error('Error fetching older messages:', messagesError);
        throw messagesError;
      }

      const messagesWithSender: MessageWithSender[] = messages.map((message) => ({
        ...message,
        sender: message.sender || { id: message.sender_id }, // Provide basic sender info even if profile fetch fails
        isCurrentUser: message.sender_id === supabase.auth.user()?.id, // Determine if the message was sent by the current user
      }));

      return messagesWithSender;
    } catch (error) {
      console.error('Error in getOlderMessages:', error);
      return [];
    }
  },
};

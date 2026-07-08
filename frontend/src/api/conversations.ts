import api from "./axios";
import type { Conversation, Message } from "../types/chat";

interface CreateOrGetConversationResponse {
  id: number;
  other_user_id: number;
}

export async function createOrGetConversation(
  otherUserId: number
): Promise<CreateOrGetConversationResponse> {
  const response = await api.post<CreateOrGetConversationResponse>(
    "/conversations",
    { other_user_id: otherUserId }
  );
  return response.data;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>("/conversations");
  return response.data;
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const response = await api.get<Message[]>(
    `/conversations/${conversationId}/messages`
  );
  return response.data;
}

import api from "./axios";
import type { Conversation, Message } from "../types/chat";

export async function createOrGetConversation(
  otherUserId: number
): Promise<Conversation> {
  const response = await api.post<Conversation>(
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

import { useEffect, useRef, useState } from "react";

import { getMessages } from "../api/conversations";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import type { Conversation, Message } from "../types/chat";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

interface ChatWindowProps {
  conversation: Conversation;
  isOtherUserOnline: boolean;
}

function ChatWindow({ conversation, isOtherUserOnline }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);
  const { user } = useAuth();
  const { lastMessage, readReceipt, typingStatus } = useSocket();

  useEffect(() => {
    let isCurrentConversation = true;

    async function fetchMessages() {
      setIsLoading(true);

      try {
        const fetchedMessages = await getMessages(conversation.id);

        if (isCurrentConversation) {
          setMessages(fetchedMessages);
        }
      } finally {
        if (isCurrentConversation) {
          setIsLoading(false);
        }
      }
    }

    fetchMessages();

    return () => {
      isCurrentConversation = false;
    };
  }, [conversation.id]);

  useEffect(() => {
    if (!lastMessage || lastMessage.conversation_id !== conversation.id) {
      return;
    }

    setMessages((currentMessages) => {
      const lastCurrentMessage = currentMessages[currentMessages.length - 1];

      if (lastCurrentMessage?.id === lastMessage.id) {
        return currentMessages;
      }

      return [...currentMessages, lastMessage];
    });
  }, [conversation.id, lastMessage]);

  useEffect(() => {
    if (!readReceipt || readReceipt.conversationId !== conversation.id) {
      return;
    }

    const readMessageIds = new Set(readReceipt.messageIds);

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        readMessageIds.has(message.id) ? { ...message, is_read: true } : message
      )
    );
  }, [conversation.id, readReceipt]);

  useEffect(() => {
    if (
      !typingStatus ||
      typingStatus.conversationId !== conversation.id ||
      typingStatus.senderId !== conversation.other_user.id
    ) {
      return;
    }

    setIsOtherUserTyping(typingStatus.isTyping);
  }, [conversation.id, conversation.other_user.id, typingStatus]);

  useEffect(() => {
    setIsOtherUserTyping(false);
  }, [conversation.id]);

  useEffect(() => {
    const messageList = messageListRef.current;

    if (messageList && messages.length > previousMessageCountRef.current) {
      messageList.scrollTop = messageList.scrollHeight;
    }

    previousMessageCountRef.current = messages.length;
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      <header className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-950 dark:text-white">
              {conversation.other_user.name}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  isOtherUserOnline ? "bg-green-500" : "bg-slate-400"
                }`}
              />
              <span>{isOtherUserOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950"
        ref={messageListRef}
      >
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 dark:border-slate-700 dark:border-t-sky-400" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
            No messages yet. Say hi!
          </div>
        )}

        {!isLoading &&
          messages.map((message) => (
            <MessageBubble
              isOwnMessage={message.sender_id === user?.id}
              key={message.id}
              message={message}
            />
          ))}
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <TypingIndicator
          isVisible={isOtherUserTyping}
          userName={conversation.other_user.name}
        />
        <MessageInput conversationId={conversation.id} />
      </div>
    </div>
  );
}

export default ChatWindow;

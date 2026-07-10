import { useEffect, useRef, useState } from "react";

import { createOrGetConversation } from "../api/conversations";
import ChatLayout from "../components/ChatLayout";
import ChatWindow from "../components/ChatWindow";
import ConversationList, {
  type ConversationListHandle,
} from "../components/ConversationList";
import NewChatModal from "../components/NewChatModal";
import { useSocket } from "../hooks/useSocket";
import type { User } from "../types/auth";
import type { Conversation } from "../types/chat";

function Home() {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
  const conversationListRef = useRef<ConversationListHandle | null>(null);
  const { lastMessage, onlineStatusUpdate, sendRead } = useSocket();

  useEffect(() => {
    if (!onlineStatusUpdate) {
      return;
    }

    setOnlineUserIds((currentOnlineUserIds) => {
      const nextOnlineUserIds = new Set(currentOnlineUserIds);

      if (onlineStatusUpdate.isOnline) {
        nextOnlineUserIds.add(onlineStatusUpdate.userId);
      } else {
        nextOnlineUserIds.delete(onlineStatusUpdate.userId);
      }

      return nextOnlineUserIds;
    });
  }, [onlineStatusUpdate]);

  useEffect(() => {
    if (!activeConversation) {
      return;
    }

    sendRead(activeConversation.id);
    conversationListRef.current?.refreshConversations();
  }, [activeConversation, sendRead]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    conversationListRef.current?.refreshConversations();
  }, [lastMessage]);

  async function handleUserSelected(user: User): Promise<void> {
    const conversationResponse = await createOrGetConversation(user.id);
    setIsNewChatModalOpen(false);

    await conversationListRef.current?.refreshConversations();

    const refreshedConversation = conversationListRef.current?.conversations.find(
      (conversation) => conversation.id === conversationResponse.id
    );

    setActiveConversation(
      refreshedConversation ?? {
        id: conversationResponse.id,
        other_user: user,
        last_message: null,
        last_message_at: null,
        unread_count: 0,
      }
    );
  }

  return (
    <>
      <ChatLayout
        isConversationActive={!!activeConversation}
        sidebar={
          <div className="flex h-full flex-col bg-white dark:bg-slate-950">
            <div className="shrink-0 border-b border-slate-200 p-3 dark:border-slate-800">
              <button
                className="mx-auto block w-full max-w-xs rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                type="button"
                onClick={() => setIsNewChatModalOpen(true)}
              >
                New Chat
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <ConversationList
                activeConversationId={activeConversation?.id ?? null}
                onSelectConversation={setActiveConversation}
                onlineUserIds={onlineUserIds}
                ref={conversationListRef}
              />
            </div>
          </div>
        }
      >
        {activeConversation ? (
          <div className="flex h-full w-full flex-col">
            <div className="min-h-0 flex-1">
              <ChatWindow
                conversation={activeConversation}
                isOtherUserOnline={onlineUserIds.has(
                  activeConversation.other_user.id
                )}
                onBack={() => setActiveConversation(null)}
                showBackButton={true}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-slate-500 dark:text-slate-400">
            Select a conversation to start chatting
          </div>
        )}
      </ChatLayout>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onUserSelected={handleUserSelected}
      />
    </>
  );
}

export default Home;

import { useEffect, useState } from "react";

import ChatLayout from "../components/ChatLayout";
import ConversationList from "../components/ConversationList";
import { useSocket } from "../hooks/useSocket";
import type { Conversation } from "../types/chat";

function Home() {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
  const { onlineStatusUpdate } = useSocket();

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

  return (
    <ChatLayout
      sidebar={
        <ConversationList
          activeConversationId={activeConversation?.id ?? null}
          onSelectConversation={setActiveConversation}
          onlineUserIds={onlineUserIds}
        />
      }
    >
      <div className="flex h-full items-center justify-center px-4 text-center text-slate-500 dark:text-slate-400">
        {activeConversation
          ? `Chat with ${activeConversation.other_user.name}`
          : "Select a conversation to start chatting"}
      </div>
    </ChatLayout>
  );
}

export default Home;

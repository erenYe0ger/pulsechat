import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { getConversations } from "../api/conversations";
import type { Conversation } from "../types/chat";
import ConversationListItem from "./ConversationListItem";

interface ConversationListProps {
  activeConversationId: number | null;
  onSelectConversation: (conversation: Conversation) => void;
  onlineUserIds: Set<number>;
}

export interface ConversationListHandle {
  conversations: Conversation[];
  refreshConversations: () => Promise<void>;
}

const ConversationList = forwardRef<ConversationListHandle, ConversationListProps>(
  function ConversationList(
    { activeConversationId, onSelectConversation, onlineUserIds },
    ref
  ) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshConversations = useCallback(async () => {
      const fetchedConversations = await getConversations();
      setConversations(fetchedConversations);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        conversations,
        refreshConversations,
      }),
      [conversations, refreshConversations]
    );

    useEffect(() => {
      async function fetchConversations() {
        try {
          await refreshConversations();
        } finally {
          setIsLoading(false);
        }
      }

      fetchConversations();
    }, [refreshConversations]);

    if (isLoading) {
      return (
        <div className="h-full overflow-y-auto p-3">
          <div className="space-y-2">
          {[0, 1, 2].map((item) => (
            <div
              className="h-16 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800"
              key={item}
            />
          ))}
          </div>
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="h-full overflow-y-auto">
          <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
            No conversations yet. Search for a user to start chatting.
          </p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto">
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {conversations.map((conversation) => (
          <ConversationListItem
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            isOnline={onlineUserIds.has(conversation.other_user.id)}
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
          />
        ))}
        </div>
      </div>
    );
  }
);

export default ConversationList;

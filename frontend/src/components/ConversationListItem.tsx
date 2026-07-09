import type { Conversation } from "../types/chat";
import { parseUTCDate } from "../utils/date";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  isOnline: boolean;
  onClick: () => void;
}

function formatRelativeTime(value: string): string {
  const date = parseUTCDate(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ConversationListItem({
  conversation,
  isActive,
  isOnline,
  onClick,
}: ConversationListItemProps) {
  const hasUnread = conversation.unread_count > 0;

  return (
    <button
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
        isActive ? "bg-sky-50 dark:bg-sky-950/40" : "bg-transparent"
      }`}
      type="button"
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`truncate text-sm text-slate-950 dark:text-white ${
                hasUnread ? "font-bold" : "font-medium"
              }`}
            >
              {conversation.other_user.name}
            </span>
            {isOnline && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-green-500"
                aria-label="Online"
              />
            )}
          </div>

          {conversation.last_message_at && (
            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {formatRelativeTime(conversation.last_message_at)}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {conversation.last_message ?? "No messages yet"}
          </p>

          {hasUnread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-sky-600 px-1.5 text-xs font-semibold text-white">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ConversationListItem;

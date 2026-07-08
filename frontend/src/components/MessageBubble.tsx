import type { Message } from "../types/chat";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[80%] flex-col gap-1 sm:max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
            isOwnMessage
              ? "rounded-br-sm bg-sky-600 text-white dark:bg-sky-500"
              : "rounded-bl-sm bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        <div className="flex items-center gap-1 px-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatMessageTime(message.created_at)}</span>
          {isOwnMessage && (
            <span className="text-sky-600 dark:text-sky-400" aria-label={message.is_read ? "Read" : "Sent"}>
              {message.is_read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;

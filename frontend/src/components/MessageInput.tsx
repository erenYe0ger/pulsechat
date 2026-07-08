import { FormEvent, useEffect, useRef, useState } from "react";

import { useSocket } from "../hooks/useSocket";

interface MessageInputProps {
  conversationId: number;
}

function MessageInput({ conversationId }: MessageInputProps) {
  const [draftMessage, setDraftMessage] = useState("");
  const typingTimeoutRef = useRef<number | null>(null);
  const { sendMessage, sendTyping } = useSocket();
  const trimmedMessage = draftMessage.trim();

  function clearTypingTimeout(): void {
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }

  function stopTyping(): void {
    clearTypingTimeout();
    sendTyping(conversationId, false);
  }

  function handleChange(value: string): void {
    setDraftMessage(value);
    sendTyping(conversationId, true);
    clearTypingTimeout();

    typingTimeoutRef.current = window.setTimeout(() => {
      sendTyping(conversationId, false);
      typingTimeoutRef.current = null;
    }, 2000);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!trimmedMessage) {
      return;
    }

    sendMessage(conversationId, trimmedMessage);
    setDraftMessage("");
    stopTyping();
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        clearTypingTimeout();
        sendTyping(conversationId, false);
      }
    };
  }, [conversationId, sendTyping]);

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <input
        className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        placeholder="Type a message"
        type="text"
        value={draftMessage}
        onChange={(event) => handleChange(event.target.value)}
      />
      <button
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:bg-sky-500 dark:hover:bg-sky-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
        disabled={!trimmedMessage}
        type="submit"
      >
        Send
      </button>
    </form>
  );
}

export default MessageInput;

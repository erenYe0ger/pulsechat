import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import type { Message } from "../types/chat";

interface TypingStatus {
  conversationId: number;
  isTyping: boolean;
  senderId: number;
}

interface ReadReceipt {
  conversationId: number;
  messageIds: number[];
}

interface OnlineStatusUpdate {
  userId: number;
  isOnline: boolean;
}

interface SocketContextValue {
  lastMessage: Message | null;
  typingStatus: TypingStatus | null;
  readReceipt: ReadReceipt | null;
  onlineStatusUpdate: OnlineStatusUpdate | null;
  sendMessage: (conversationId: number, content: string) => void;
  sendTyping: (conversationId: number, isTyping: boolean) => void;
  sendRead: (conversationId: number) => void;
}

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined
);

function isSocketOpen(socket: WebSocket | null): socket is WebSocket {
  return socket?.readyState === WebSocket.OPEN;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { token } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [typingStatus, setTypingStatus] = useState<TypingStatus | null>(null);
  const [readReceipt, setReadReceipt] = useState<ReadReceipt | null>(null);
  const [onlineStatusUpdate, setOnlineStatusUpdate] =
    useState<OnlineStatusUpdate | null>(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.close();
      socketRef.current = null;
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";
    const socket = new WebSocket(
      `${wsUrl}/ws?token=${encodeURIComponent(token)}`
    );
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "message":
          setLastMessage(data.message);
          break;
        case "typing":
          setTypingStatus({
            conversationId: data.conversation_id,
            isTyping: data.is_typing,
            senderId: data.sender_id,
          });
          break;
        case "read_receipt":
          setReadReceipt({
            conversationId: data.conversation_id,
            messageIds: data.message_ids,
          });
          break;
        case "status":
          setOnlineStatusUpdate({
            userId: data.user_id,
            isOnline: data.is_online,
          });
          break;
      }
    };

    socket.onclose = () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };

    return () => {
      socket.close();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token]);

  function sendSocketData(data: object): void {
    if (isSocketOpen(socketRef.current)) {
      socketRef.current.send(JSON.stringify(data));
    }
  }

  function sendMessage(conversationId: number, content: string): void {
    sendSocketData({
      type: "message",
      conversation_id: conversationId,
      content,
    });
  }

  function sendTyping(conversationId: number, isTyping: boolean): void {
    sendSocketData({
      type: "typing",
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  }

  function sendRead(conversationId: number): void {
    sendSocketData({
      type: "read",
      conversation_id: conversationId,
    });
  }

  return (
    <SocketContext.Provider
      value={{
        lastMessage,
        typingStatus,
        readReceipt,
        onlineStatusUpdate,
        sendMessage,
        sendTyping,
        sendRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "@/components/chat/MessageBubble";

interface UseChatSocketProps {
  conversationId?: string;
  receiverId?: string;
  onNewMessage?: (message: Message) => void;
  onTyping?: (data: { conversationId: string; userId: string }) => void;
  onStopTyping?: (data: { conversationId: string; userId: string }) => void;
  onMessagesRead?: (data: { conversationId: string; userId: string }) => void;
  onNotification?: (message: any) => void;
}

export function useChatSocket({
  conversationId,
  receiverId,
  onNewMessage,
  onTyping,
  onStopTyping,
  onMessagesRead,
  onNotification,
}: UseChatSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:5004";

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (conversationId) {
        socket.emit("join_conversation", conversationId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("new_message", (msg: any) => {
      if (onNewMessage) {
        const formatted: Message = {
          id: msg.id || msg._id || String(Date.now()),
          senderId: msg.senderId,
          text: msg.content || msg.text || "",
          createdAt: msg.createdAt || new Date().toISOString(),
        };
        onNewMessage(formatted);
      }
    });

    socket.on("user_typing", (data: any) => {
      if (onTyping) onTyping(data);
    });

    socket.on("user_stopped_typing", (data: any) => {
      if (onStopTyping) onStopTyping(data);
    });

    socket.on("messages_read", (data: any) => {
      if (onMessagesRead) onMessagesRead(data);
    });

    socket.on("message_notification", (data: any) => {
      if (onNotification) onNotification(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // When active conversation changes, join the room
  useEffect(() => {
    if (socketRef.current && isConnected && conversationId) {
      socketRef.current.emit("join_conversation", conversationId);
    }
  }, [conversationId, isConnected]);

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !conversationId || !receiverId) return;

    socketRef.current.emit("typing", { conversationId, receiverId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("stop_typing", { conversationId, receiverId });
      }
    }, 2500);
  }, [conversationId, receiverId]);

  const emitStopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socketRef.current && conversationId && receiverId) {
      socketRef.current.emit("stop_typing", { conversationId, receiverId });
    }
  }, [conversationId, receiverId]);

  const emitRead = useCallback(() => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("messages_read", { conversationId });
    }
  }, [conversationId]);

  return {
    socket: socketRef.current,
    isConnected,
    emitTyping,
    emitStopTyping,
    emitRead,
  };
}

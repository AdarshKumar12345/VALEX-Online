"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "@/components/chat/MessageBubble";

export interface UseChatSocketProps {
  conversationId?: string;
  receiverId?: string;
  enabled?: boolean;
  onNewMessage?: (message: Message) => void;
  onTyping?: (data: { conversationId: string; userId: string }) => void;
  onStopTyping?: (data: { conversationId: string; userId: string }) => void;
  onMessagesRead?: (data: { conversationId: string; userId: string }) => void;
  onNotification?: (message: any) => void;
}

export function useChatSocket({
  conversationId,
  receiverId,
  enabled = true,
  onNewMessage,
  onTyping,
  onStopTyping,
  onMessagesRead,
  onNotification,
}: UseChatSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store latest callbacks in ref to prevent stale closures and avoid unnecessary reconnects
  const callbacksRef = useRef({
    onNewMessage,
    onTyping,
    onStopTyping,
    onMessagesRead,
    onNotification,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNewMessage,
      onTyping,
      onStopTyping,
      onMessagesRead,
      onNotification,
    };
  }, [onNewMessage, onTyping, onStopTyping, onMessagesRead, onNotification]);

  // Manage connection lifecycle
  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:5004";

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
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

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      // If token expired or auth failed, stop reconnect spamming
      const msg = error.message?.toLowerCase() || "";
      if (
        msg.includes("token") ||
        msg.includes("auth") ||
        msg.includes("expired")
      ) {
        socket.disconnect();
      }
    });

    socket.on("new_message", (msg: any) => {
      if (callbacksRef.current.onNewMessage) {
        const formatted: Message = {
          id: msg.id || msg._id || String(Date.now()),
          senderId: msg.senderId,
          text: msg.content || msg.text || "",
          createdAt: msg.createdAt || new Date().toISOString(),
        };
        callbacksRef.current.onNewMessage(formatted);
      }
    });

    socket.on("user_typing", (data: any) => {
      callbacksRef.current.onTyping?.(data);
    });

    socket.on("user_stopped_typing", (data: any) => {
      callbacksRef.current.onStopTyping?.(data);
    });

    socket.on("messages_read", (data: any) => {
      callbacksRef.current.onMessagesRead?.(data);
    });

    socket.on("message_notification", (data: any) => {
      callbacksRef.current.onNotification?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [enabled]);

  // When active conversation changes, join the room on existing socket
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

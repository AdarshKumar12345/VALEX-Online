"use client";

import React, { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { useChatSocket } from "@/hooks/useChatSocket";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import { Conversation } from "@/components/chat/ConversationItem";
import { Message } from "@/components/chat/MessageBubble";
import { ChatSkeleton } from "@/components/ui/Skeleton";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const listingParam = searchParams.get("listing");
  const recipientParam = searchParams.get("recipient");

  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  // Real-time WebSocket connection
  const { emitTyping } = useChatSocket({
    conversationId: selectedConv?.id,
    receiverId: selectedConv?.participantId,
    onNewMessage: (newMsg) => {
      if (selectedConv && (newMsg as any).conversationId === selectedConv.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        apiFetch(`/chats/${encodeURIComponent(selectedConv.id)}/read`, { method: "PATCH" }).catch(() => {});
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === (newMsg as any).conversationId || c.id === selectedConv?.id) {
            return {
              ...c,
              lastMessage: newMsg.text,
              lastMessageAt: newMsg.createdAt,
              unreadCount: selectedConv?.id === c.id ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    },
    onTyping: (data) => {
      if (selectedConv && data.conversationId === selectedConv.id && data.userId !== user?.id) {
        setPartnerTyping(true);
      }
    },
    onStopTyping: (data) => {
      if (selectedConv && data.conversationId === selectedConv.id) {
        setPartnerTyping(false);
      }
    },
    onNotification: (notif) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === notif.conversationId) {
            return {
              ...c,
              lastMessage: notif.content || notif.text,
              lastMessageAt: notif.createdAt,
              unreadCount: (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    },
  });

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        const data = await apiFetch<any>("/chats").catch(() => ({ chats: [] }));
        const list: Conversation[] = data.chats || data.data || (Array.isArray(data) ? data : []);

        // If user navigated with ?listing= or ?recipient= and conversation doesn't exist yet, create or find it
        if ((listingParam || recipientParam) && !list.find((c) => c.listingId === listingParam)) {
          try {
            const newConvRes = await apiFetch<any>("/chats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                listingId: listingParam,
                recipientId: recipientParam,
              }),
            });
            const created = newConvRes.chat || newConvRes.data || newConvRes;
            if (created && created.id) {
              list.unshift(created);
              setSelectedConv(created);
            }
          } catch {
            // fallback
          }
        }

        setConversations(list);

        if (!selectedConv && list.length > 0) {
          setSelectedConv(list[0]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [listingParam, recipientParam]);

  // Load messages for active conversation
  useEffect(() => {
    if (!selectedConv) {
      setMessages([]);
      return;
    }

    const convId = selectedConv.id;
    let isSubscribed = true;

    // Load messages and mark as read
    async function loadMessages() {
      try {
        setLoadingMessages(true);
        const data = await apiFetch<any>(`/chats/${encodeURIComponent(convId)}/messages`).catch(() => ({ messages: [] }));
        if (isSubscribed) {
          const list: Message[] = data.messages || data.data || (Array.isArray(data) ? data : []);
          setMessages(list);
        }
      } finally {
        if (isSubscribed) setLoadingMessages(false);
      }
    }

    loadMessages();
    apiFetch(`/chats/${encodeURIComponent(convId)}/read`, { method: "PATCH" }).catch(() => {});
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );

    const interval = setInterval(loadMessages, 3500); // 3.5s polling fallback

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [selectedConv]);

  async function handleSendMessage(text: string) {
    if (!selectedConv) return;

    // Optimistic message
    const tempId = "temp-" + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      senderId: user?.id || "me",
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await apiFetch<any>(`/chats/${encodeURIComponent(selectedConv.id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const actualMsg = res.message || res.data || res;
      if (actualMsg && actualMsg.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? actualMsg : m))
        );
      }

      // Update conversation last message in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      // Revert if failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <ChatSkeleton />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="h-[750px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm flex flex-col sm:flex-row">
        {/* Left Sidebar: Conversations */}
        <div
          className={`w-full sm:w-80 border-r border-neutral-200 flex flex-col ${
            selectedConv ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="border-b border-neutral-200 p-4">
            <h1 className="text-base font-bold text-black">Messages</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Conversations with buyers and sellers
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConv?.id}
              onSelect={(conv) => setSelectedConv(conv)}
            />
          </div>
        </div>

        {/* Right Pane: Chat Window */}
        <div
          className={`flex-1 flex flex-col ${
            !selectedConv ? "hidden sm:flex" : "flex"
          }`}
        >
          {selectedConv ? (
            <ChatWindow
              conversation={selectedConv}
              messages={messages}
              currentUserId={user?.id}
              isTyping={partnerTyping}
              onSendMessage={handleSendMessage}
              onTyping={emitTyping}
              onBackMobile={() => setSelectedConv(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import MessageBubble, { Message } from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { Conversation } from "./ConversationItem";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId?: string;
  isTyping?: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onTyping?: () => void;
  onBackMobile?: () => void;
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  isTyping,
  onSendMessage,
  onTyping,
  onBackMobile,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {onBackMobile && (
            <button
              type="button"
              onClick={onBackMobile}
              className="sm:hidden p-1.5 text-neutral-500 hover:text-black"
              aria-label="Back to conversations"
            >
              ←
            </button>
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
            {conversation.participantAvatar ? (
              <img
                src={conversation.participantAvatar}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              conversation.participantName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-black">
              {conversation.participantName}
            </h2>
            {conversation.listingId && (
              <Link
                href={`/listings/${conversation.listingId}`}
                className="truncate block text-xs text-neutral-500 hover:underline"
              >
                Listing: {conversation.listingTitle || "View Listing"}
              </Link>
            )}
          </div>
        </div>

        {conversation.listingId && (
          <Link
            href={`/listings/${conversation.listingId}`}
            className="hidden sm:inline-flex rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold hover:border-black transition"
          >
            View Item
          </Link>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            Send a message to start the conversation.
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={Boolean(currentUserId && msg.senderId === currentUserId)}
            />
          ))
        )}
        {isTyping && (
          <TypingIndicator name={conversation.participantName} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSend={onSendMessage} onTyping={onTyping} />
    </div>
  );
}

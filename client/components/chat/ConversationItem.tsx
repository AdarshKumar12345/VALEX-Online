import React from "react";
import { formatDate } from "@/lib/utils";

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  listingId?: string;
  listingTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conv: Conversation) => void;
}

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={`w-full text-left p-3.5 rounded-xl transition flex items-start gap-3 ${
        isSelected
          ? "bg-black text-white"
          : "hover:bg-neutral-100 text-black"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isSelected
            ? "bg-white text-black"
            : "bg-black text-white"
        }`}
      >
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-xs font-bold">
            {conversation.participantName}
          </p>
          {conversation.lastMessageAt && (
            <span
              className={`text-[10px] shrink-0 ${
                isSelected ? "text-neutral-400" : "text-neutral-400"
              }`}
            >
              {formatDate(conversation.lastMessageAt)}
            </span>
          )}
        </div>

        {conversation.listingTitle && (
          <p
            className={`truncate text-[11px] font-medium mt-0.5 ${
              isSelected ? "text-neutral-300" : "text-neutral-500"
            }`}
          >
            Item: {conversation.listingTitle}
          </p>
        )}

        <div className="flex items-center justify-between gap-1 mt-1">
          <p
            className={`truncate text-xs ${
              isSelected ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            {conversation.lastMessage || "No messages yet"}
          </p>
          {Boolean(conversation.unreadCount && conversation.unreadCount > 0) && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

import React from "react";
import ConversationItem, { Conversation } from "./ConversationItem";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conv: Conversation) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-neutral-400">
        No active conversations. Start a chat from any listing page.
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 overflow-y-auto max-h-full">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

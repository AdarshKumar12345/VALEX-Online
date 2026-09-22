import React from "react";
import { formatDate } from "@/lib/utils";

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
  return (
    <div
      className={`flex flex-col ${
        isMe ? "items-end" : "items-start"
      } mb-3`}
    >
      <div
        className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
          isMe
            ? "bg-black text-white rounded-br-xs"
            : "bg-neutral-100 text-black rounded-bl-xs"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
      </div>
      <span className="mt-1 text-[10px] text-neutral-400 px-1">
        {formatDate(message.createdAt)}
      </span>
    </div>
  );
}

import React from "react";

export default function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-400 py-1.5">
      <div className="flex gap-1 items-center px-3 py-2 bg-neutral-100 rounded-full">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
      </div>
      {name && <span>{name} is typing...</span>}
    </div>
  );
}

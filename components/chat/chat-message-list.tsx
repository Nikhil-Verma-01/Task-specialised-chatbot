"use client";

import { useEffect, useRef } from "react";

import { ChatBubble } from "@/components/chat/chat-message";
import { EmptyState } from "@/components/chat/empty-state";
import { ChatMessage } from "@/types/chat";

type ChatMessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  theme: "dark" | "light";
};

export function ChatMessageList({
  messages,
  isLoading,
  theme,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bottomRef.current) {
      return;
    }

    bottomRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return <EmptyState theme={theme} />;
  }

  return (
    <div
      ref={containerRef}
      className={
        theme === "dark"
          ? "flex-1 space-y-5 overflow-y-auto scroll-smooth bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.75),rgba(2,6,23,0.98))] px-4 py-5 sm:px-6"
          : "flex-1 space-y-5 overflow-y-auto scroll-smooth bg-[linear-gradient(180deg,#f8fbff,#eef3f8)] px-4 py-5 sm:px-6"
      }
    >
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} theme={theme} />
      ))}
      {isLoading ? <ChatBubble isPlaceholder theme={theme} /> : null}
      <div ref={bottomRef} />
    </div>
  );
}

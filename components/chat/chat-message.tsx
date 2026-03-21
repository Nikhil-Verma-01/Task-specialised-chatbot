import { Bot, User2 } from "lucide-react";

import { MessageBubble } from "@/components/chat/message-bubble";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";

type ChatBubbleProps = {
  message?: ChatMessage;
  isPlaceholder?: boolean;
};

export function ChatBubble({ message, isPlaceholder = false }: ChatBubbleProps) {
  const isAssistant = isPlaceholder || message?.role === "assistant";
  const content = isPlaceholder ? "Thinking..." : message?.content;

  return (
    <div className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
          <Bot className="h-5 w-5" />
        </div>
      ) : null}

      <div className="flex max-w-3xl flex-col gap-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {isAssistant ? "Bot" : "You"}
        </p>
        <MessageBubble role={isAssistant ? "bot" : "user"} content={content || ""} />
      </div>

      {!isAssistant ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
          <User2 className="h-5 w-5" />
        </div>
      ) : null}
    </div>
  );
}

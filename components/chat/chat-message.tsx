import { Bot, User2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";

type ChatBubbleProps = {
  message?: ChatMessage;
  isPlaceholder?: boolean;
};

export function ChatBubble({ message, isPlaceholder = false }: ChatBubbleProps) {
  const isAssistant = isPlaceholder || message?.role === "assistant";
  const content = isPlaceholder ? "Thinking through the ugly parts..." : message?.content;

  return (
    <div className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
          <Bot className="h-5 w-5" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-3xl rounded-3xl px-4 py-3 text-sm leading-7 shadow-lg",
          isAssistant
            ? "border border-white/10 bg-slate-800/90 text-slate-100"
            : "bg-cyan-400 text-slate-950",
        )}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
          {isAssistant ? "Bot" : "You"}
        </p>
        <div className="whitespace-pre-wrap">{content}</div>
      </div>

      {!isAssistant ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
          <User2 className="h-5 w-5" />
        </div>
      ) : null}
    </div>
  );
}

import { Bot, User2 } from "lucide-react";

import { MessageBubble } from "@/components/chat/message-bubble";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";

type ChatBubbleProps = {
  message?: ChatMessage;
  isPlaceholder?: boolean;
  theme: "dark" | "light";
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-200/80"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </div>
  );
}

function LoadingSkeleton({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className="space-y-2">
      <div className={theme === "dark" ? "h-4 w-40 animate-pulse rounded-full bg-white/10" : "h-4 w-40 animate-pulse rounded-full bg-slate-200"} />
      <div className={theme === "dark" ? "h-4 w-56 animate-pulse rounded-full bg-white/10" : "h-4 w-56 animate-pulse rounded-full bg-slate-200"} />
      <div className={theme === "dark" ? "h-4 w-32 animate-pulse rounded-full bg-white/10" : "h-4 w-32 animate-pulse rounded-full bg-slate-200"} />
    </div>
  );
}

export function ChatBubble({ message, isPlaceholder = false, theme }: ChatBubbleProps) {
  const isAssistant = isPlaceholder || message?.role === "assistant";
  const content = isPlaceholder ? "Thinking..." : message?.content;

  return (
    <div className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant ? (
        <div className={theme === "dark" ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700"}>
          <Bot className="h-5 w-5" />
        </div>
      ) : null}

      <div className="flex max-w-3xl flex-col gap-2">
        <p className={theme === "dark" ? "px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" : "px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"}>
          {isAssistant ? "Bot" : "You"}
        </p>
        {isPlaceholder ? (
          <div className={theme === "dark" ? "max-w-[85%] rounded-3xl rounded-bl-md border border-white/10 bg-slate-800/90 px-4 py-4 shadow-lg sm:max-w-[75%] sm:px-5" : "max-w-[85%] rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-4 shadow-sm sm:max-w-[75%] sm:px-5"}>
            <TypingDots />
            <LoadingSkeleton theme={theme} />
          </div>
        ) : (
          <MessageBubble role={isAssistant ? "bot" : "user"} content={content || ""} theme={theme} />
        )}
      </div>

      {!isAssistant ? (
        <div className={theme === "dark" ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-700"}>
          <User2 className="h-5 w-5" />
        </div>
      ) : null}
    </div>
  );
}

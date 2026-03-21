import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  role: "user" | "bot";
  content: string;
};

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-sm leading-7 shadow-lg sm:max-w-[75%] sm:px-5",
          isUser
            ? "rounded-br-md bg-cyan-400 text-slate-950"
            : "rounded-bl-md border border-white/10 bg-slate-800/90 text-slate-100",
        )}
      >
        {content}
      </div>
    </div>
  );
}

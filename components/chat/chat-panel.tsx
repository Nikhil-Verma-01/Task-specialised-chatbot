"use client";

import { RotateCcw } from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatMessage, MentorContext } from "@/types/chat";

type ChatPanelProps = {
  theme: "dark" | "light";
  context: MentorContext;
  messages: ChatMessage[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  onSubmit: (content: string) => Promise<void>;
  onRetry: () => Promise<void>;
  onReset: () => void;
};

export function ChatPanel({
  theme,
  context,
  messages,
  suggestions,
  isLoading,
  error,
  onSubmit,
  onRetry,
  onReset,
}: ChatPanelProps) {
  return (
    <div className="grid min-h-[72vh] gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside
        className={
          theme === "dark"
            ? "order-2 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 text-slate-200 shadow-2xl backdrop-blur lg:order-1"
            : "order-2 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/90 p-5 text-slate-800 shadow-sm lg:order-1"
        }
      >
        <div className="space-y-2">
          <p
            className={
              theme === "dark"
                ? "text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80"
                : "text-xs font-semibold uppercase tracking-[0.24em] text-sky-700"
            }
          >
            Session Context
          </p>
          <h2
            className={
              theme === "dark"
                ? "font-[var(--font-heading)] text-2xl text-white"
                : "font-[var(--font-heading)] text-2xl text-slate-950"
            }
          >
            Startup brief
          </h2>
          <p className={theme === "dark" ? "text-sm leading-6 text-slate-400" : "text-sm leading-6 text-slate-600"}>
            The mentor keeps this context in view while responding.
          </p>
        </div>

        <div
          className={
            theme === "dark"
              ? "space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4"
              : "space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
          }
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Idea</p>
            <p className={theme === "dark" ? "mt-2 text-sm leading-6 text-slate-100" : "mt-2 text-sm leading-6 text-slate-900"}>{context.idea}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Goal</p>
            <p className={theme === "dark" ? "mt-2 text-sm leading-6 text-slate-100" : "mt-2 text-sm leading-6 text-slate-900"}>{context.goal}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stage</p>
            <Badge className={theme === "dark" ? "bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/10" : "bg-sky-100 text-sky-700 hover:bg-sky-100"} variant="secondary">
              {context.stage}
            </Badge>
          </div>
        </div>

        <SuggestionChips items={suggestions} disabled={isLoading} onSelect={onSubmit} />

        <Button
          type="button"
          variant="outline"
          className={
            theme === "dark"
              ? "mt-auto w-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              : "mt-auto w-full border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
          }
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset chat
        </Button>
      </aside>

      <section
        className={
          theme === "dark"
            ? "order-1 flex min-h-[72vh] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1120]/90 shadow-2xl backdrop-blur lg:order-2"
            : "order-1 flex min-h-[72vh] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-sm lg:order-2"
        }
      >
        <div className={theme === "dark" ? "border-b border-white/10 px-5 py-4 sm:px-6" : "border-b border-slate-200 px-5 py-4 sm:px-6"}>
          <p
            className={
              theme === "dark"
                ? "text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80"
                : "text-xs font-semibold uppercase tracking-[0.24em] text-sky-700"
            }
          >
            Chat UI
          </p>
          <h2 className={theme === "dark" ? "mt-1 font-[var(--font-heading)] text-2xl text-white" : "mt-1 font-[var(--font-heading)] text-2xl text-slate-950"}>
            Founder conversation
          </h2>
        </div>

        <ChatMessageList messages={messages} isLoading={isLoading} theme={theme} />

        <div className={theme === "dark" ? "border-t border-white/10 bg-slate-950/70 p-4 sm:p-5" : "border-t border-slate-200 bg-slate-50/90 p-4 sm:p-5"}>
          <ChatComposer
            theme={theme}
            isLoading={isLoading}
            error={error}
            onSubmit={onSubmit}
            onRetry={onRetry}
          />
        </div>
      </section>
    </div>
  );
}

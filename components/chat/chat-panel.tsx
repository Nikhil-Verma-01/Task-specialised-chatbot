"use client";

import { RotateCcw } from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MentorContext, ChatMessage } from "@/types/chat";

type ChatPanelProps = {
  context: MentorContext;
  messages: ChatMessage[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  onSubmit: (content: string) => Promise<void>;
  onReset: () => void;
};

export function ChatPanel({
  context,
  messages,
  suggestions,
  isLoading,
  error,
  onSubmit,
  onReset,
}: ChatPanelProps) {
  return (
    <div className="grid min-h-[72vh] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 text-slate-200 shadow-2xl backdrop-blur">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Session Context
          </p>
          <h2 className="font-[var(--font-heading)] text-2xl text-white">
            Startup brief
          </h2>
          <p className="text-sm leading-6 text-slate-400">
            The mentor keeps this context in view while responding.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Idea</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{context.idea}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Goal</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{context.goal}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stage</p>
            <Badge className="bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/10" variant="secondary">
              {context.stage}
            </Badge>
          </div>
        </div>

        <SuggestionChips
          items={suggestions}
          disabled={isLoading}
          onSelect={onSubmit}
        />

        <Button
          type="button"
          variant="outline"
          className="mt-auto w-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset chat
        </Button>
      </aside>

      <section className="flex min-h-[72vh] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1120]/90 shadow-2xl backdrop-blur">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Chat UI
          </p>
          <h2 className="mt-1 font-[var(--font-heading)] text-2xl text-white">
            Founder conversation
          </h2>
        </div>

        <ChatMessageList messages={messages} isLoading={isLoading} />

        <div className="border-t border-white/10 bg-slate-950/70 p-4 sm:p-5">
          <ChatComposer isLoading={isLoading} error={error} onSubmit={onSubmit} />
        </div>
      </section>
    </div>
  );
}

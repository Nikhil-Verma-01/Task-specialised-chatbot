"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { APP_COPY, GOALS, STAGES, SUGGESTIONS } from "@/lib/constants";
import {
  loadConversation,
  loadMentorContext,
  saveConversation,
  saveMentorContext,
} from "@/lib/storage";
import { ChatMessage, MentorContext } from "@/types/chat";

type MentorChatPageProps = {
  initialContext: MentorContext;
};

export function MentorChatPage({ initialContext }: MentorChatPageProps) {
  const [context, setContext] = useState<MentorContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasQueryContext = Boolean(initialContext.idea.trim());
    const normalizedContext = {
      idea: initialContext.idea.trim(),
      stage: STAGES.includes(initialContext.stage) ? initialContext.stage : STAGES[0],
      goal: GOALS.includes(initialContext.goal) ? initialContext.goal : GOALS[0],
    };

    if (hasQueryContext) {
      setContext(normalizedContext);
      setMessages([]);
      saveMentorContext(normalizedContext);
      saveConversation([]);
      return;
    }

    const storedContext = loadMentorContext();
    const storedMessages = loadConversation();

    if (storedContext) {
      setContext(storedContext);
    }

    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
  }, [initialContext]);

  useEffect(() => {
    if (context) {
      saveMentorContext(context);
    }
  }, [context]);

  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  const headerStats = useMemo(
    () => [
      { label: "Stage", value: context?.stage ?? "Idea" },
      { label: "Goal", value: context?.goal ?? "Validate idea" },
      { label: "Mode", value: "Dark UI" },
    ],
    [context],
  );

  async function handleSubmitMessage(content: string) {
    if (!context || !content.trim() || isLoading) {
      return;
    }

    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context,
          messages: nextMessages.map(({ id, role, content: body }) => ({
            id,
            role,
            content: body,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unexpected error while reaching the mentor API.",
      );
      setMessages(nextMessages);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setContext(null);
    setMessages([]);
    setError(null);
    saveConversation([]);
    saveMentorContext(null);
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">
              Lean Startup Mentor Bot
            </p>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-[var(--font-heading)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Minimal chat UI for startup feedback.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                {APP_COPY.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {headerStats.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {context ? (
          <ChatPanel
            context={context}
            messages={messages}
            isLoading={isLoading}
            error={error}
            suggestions={SUGGESTIONS}
            onReset={handleReset}
            onSubmit={handleSubmitMessage}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center shadow-panel">
            <p className="text-sm text-slate-400">
              No setup data found. Start a new analysis to continue.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-xl bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950"
            >
              Back to setup
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

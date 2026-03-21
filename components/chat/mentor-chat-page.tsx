"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { APP_COPY, GOALS, STAGES, SUGGESTIONS } from "@/lib/constants";
import {
  clearChatSession,
  loadChatSession,
  saveChatSession,
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
  const [isHydrated, setIsHydrated] = useState(false);

  function normalizeContext(value: MentorContext): MentorContext {
    return {
      idea: value.idea.trim(),
      stage: STAGES.includes(value.stage) ? value.stage : STAGES[0],
      goal: GOALS.includes(value.goal) ? value.goal : GOALS[0],
    };
  }

  function isSameContext(left: MentorContext, right: MentorContext) {
    return (
      left.idea === right.idea &&
      left.stage === right.stage &&
      left.goal === right.goal
    );
  }

  useEffect(() => {
    const storedSession = loadChatSession();
    const normalizedContext = normalizeContext(initialContext);
    const hasQueryContext = Boolean(normalizedContext.idea);

    if (hasQueryContext && storedSession) {
      if (isSameContext(storedSession.context, normalizedContext)) {
        setContext(storedSession.context);
        setMessages(storedSession.messages);
      } else {
        setContext(normalizedContext);
        setMessages([]);
      }

      setIsHydrated(true);
      return;
    }

    if (hasQueryContext) {
      setContext(normalizedContext);
      setMessages([]);
      setIsHydrated(true);
      return;
    }

    if (storedSession) {
      setContext(storedSession.context);
      setMessages(storedSession.messages);
    }

    setIsHydrated(true);
  }, [initialContext]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!context) {
      clearChatSession();
      return;
    }

    saveChatSession({
      context,
      messages,
    });
  }, [context, isHydrated, messages]);

  const headerStats = useMemo(
    () => [
      { label: "Stage", value: context?.stage ?? "Idea" },
      { label: "Goal", value: context?.goal ?? "Validate idea" },
      { label: "Mode", value: "Dark UI" },
    ],
    [context],
  );

  async function handleSubmitMessage(content: string) {
    const trimmedContent = content.trim();

    if (!context || !trimmedContent || isLoading) {
      return;
    }

    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedContent,
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
          message: trimmedContent,
          idea: context.idea,
          stage: context.stage,
          goal: context.goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
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
    clearChatSession();
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

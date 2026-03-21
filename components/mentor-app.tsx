"use client";

import { useEffect, useMemo, useState } from "react";

import { ChatPanel } from "@/components/chat/chat-panel";
import { SetupForm } from "@/components/setup-form";
import { APP_COPY, SUGGESTIONS } from "@/lib/constants";
import {
  loadConversation,
  loadMentorContext,
  saveConversation,
  saveMentorContext,
} from "@/lib/storage";
import { ChatMessage, MentorContext } from "@/types/chat";

export function MentorApp() {
  const [context, setContext] = useState<MentorContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedContext = loadMentorContext();
    const storedMessages = loadConversation();

    if (storedContext) {
      setContext(storedContext);
    }

    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
  }, []);

  useEffect(() => {
    if (context) {
      saveMentorContext(context);
    }
  }, [context]);

  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  const hasSession = Boolean(context);

  const headerStats = useMemo(
    () => [
      { label: "Positioning", value: "Opinionated" },
      { label: "Output", value: "Structured" },
      { label: "Memory", value: "Local" },
    ],
    [],
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

  function handleStart(nextContext: MentorContext) {
    setContext(nextContext);
    setMessages([]);
    setError(null);
  }

  function handleReset() {
    setContext(null);
    setMessages([]);
    setError(null);
    saveConversation([]);
    saveMentorContext(null);
  }

  return (
    <main className="min-h-screen py-10">
      <div className="container">
        <section className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                Lean Startup Mentor Bot
              </p>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-[var(--font-heading)] text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Pressure-test startup ideas before the market does it for you.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                  {APP_COPY.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {headerStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-panel backdrop-blur"
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {hasSession ? (
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
            <SetupForm onStart={handleStart} />
          )}
        </section>
      </div>
    </main>
  );
}

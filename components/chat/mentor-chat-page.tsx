"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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

type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "lean-startup-mentor-theme";

export function MentorChatPage({ initialContext }: MentorChatPageProps) {
  const [context, setContext] = useState<MentorContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSubmittedMessage, setLastSubmittedMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const cursorGlowRef = useRef<HTMLDivElement>(null);

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
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frame = 0;

    function handlePointerMove(event: PointerEvent) {
      if (!cursorGlowRef.current) {
        return;
      }

      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!cursorGlowRef.current) {
          return;
        }

        cursorGlowRef.current.style.transform = `translate(${event.clientX - 180}px, ${event.clientY - 180}px)`;
        cursorGlowRef.current.style.opacity = "1";
      });
    }

    function handlePointerLeave() {
      if (!cursorGlowRef.current) {
        return;
      }

      cursorGlowRef.current.style.opacity = "0";
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  const headerStats = useMemo(
    () => [
      { label: "Stage", value: context?.stage ?? "Idea" },
      { label: "Goal", value: context?.goal ?? "Validate idea" },
      { label: "Mode", value: theme === "dark" ? "Dark UI" : "Light UI" },
    ],
    [context, theme],
  );

  async function requestBotReply(
    userContent: string,
    nextMessages: ChatMessage[],
  ) {
    if (!context || isLoading) {
      return;
    }

    setError(null);
    setLastSubmittedMessage(userContent);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userContent,
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

  async function handleSubmitMessage(content: string) {
    const trimmedContent = content.trim();

    if (!context || !trimmedContent || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    await requestBotReply(trimmedContent, nextMessages);
  }

  function handleReset() {
    setContext(null);
    setMessages([]);
    setError(null);
    setLastSubmittedMessage(null);
    clearChatSession();
  }

  async function handleRetry() {
    if (!context || !lastSubmittedMessage || isLoading) {
      return;
    }

    await requestBotReply(lastSubmittedMessage, messages);
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <main
      className={
        theme === "dark"
          ? "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_24%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_22%),linear-gradient(180deg,#020617,#081223_42%,#0b1325)] px-4 py-8 text-slate-100"
          : "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),linear-gradient(180deg,#fffdf8,#f7f5ef_38%,#eef4f8)] px-4 py-8 text-slate-900"
      }
    >
      <div
        ref={cursorGlowRef}
        className={
          theme === "dark"
            ? "pointer-events-none fixed left-0 top-0 z-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16),rgba(251,146,60,0.08)_38%,transparent_72%)] opacity-0 blur-3xl transition-opacity duration-300"
            : "pointer-events-none fixed left-0 top-0 z-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.16),rgba(16,185,129,0.10)_38%,transparent_72%)] opacity-0 blur-3xl transition-opacity duration-300"
        }
      />

      <div
        className={
          theme === "dark"
            ? "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_28%)]"
            : "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_28%)]"
        }
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p
              className={
                theme === "dark"
                  ? "text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80"
                  : "text-sm font-medium uppercase tracking-[0.24em] text-sky-700"
              }
            >
              Lean Startup Mentor Bot
            </p>
            <div className="space-y-3">
              <h1
                className={
                  theme === "dark"
                    ? "max-w-3xl font-[var(--font-heading)] text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                    : "max-w-3xl font-[var(--font-heading)] text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl"
                }
              >
                Minimal chat UI for startup feedback.
              </h1>
              <p
                className={
                  theme === "dark"
                    ? "max-w-2xl text-base leading-7 text-slate-400 sm:text-lg"
                    : "max-w-2xl text-base leading-7 text-slate-600 sm:text-lg"
                }
              >
                {APP_COPY.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={toggleTheme}
              className={
                theme === "dark"
                  ? "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(56,189,248,0.14)]"
                  : "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_16px_40px_rgba(14,165,233,0.12)]"
              }
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>

            <div className="grid gap-3 sm:grid-cols-3">
            {headerStats.map((item) => (
              <div
                key={item.label}
                className={
                  theme === "dark"
                    ? "rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur"
                    : "rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm"
                }
              >
                <p
                  className={
                    theme === "dark"
                      ? "text-xs uppercase tracking-[0.18em] text-slate-500"
                      : "text-xs uppercase tracking-[0.18em] text-slate-500"
                  }
                >
                  {item.label}
                </p>
                <p
                  className={
                    theme === "dark"
                      ? "mt-2 text-sm font-semibold text-white"
                      : "mt-2 text-sm font-semibold text-slate-900"
                  }
                >
                  {item.value}
                </p>
              </div>
            ))}
            </div>
          </div>
        </section>

        {context ? (
          <ChatPanel
            theme={theme}
            context={context}
            messages={messages}
            isLoading={isLoading}
            error={error}
            suggestions={SUGGESTIONS}
            onReset={handleReset}
            onSubmit={handleSubmitMessage}
            onRetry={handleRetry}
          />
        ) : (
          <div
            className={
              theme === "dark"
                ? "rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center shadow-panel"
                : "rounded-[1.75rem] border border-slate-200 bg-white/90 p-8 text-center shadow-sm"
            }
          >
            <p className={theme === "dark" ? "text-sm text-slate-400" : "text-sm text-slate-600"}>
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

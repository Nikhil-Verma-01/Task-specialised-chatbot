"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GOALS, STAGES } from "@/lib/constants";
import { MentorContext } from "@/types/chat";

type SetupFormProps = {
  initialValue?: Partial<MentorContext>;
  submitLabel?: string;
  onSubmitContext?: (context: MentorContext) => void;
};

type RadioGroupProps = {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const HERO_COPY =
  "Share what you are building and what kind of help you need. The analysis starts with clear context, not vague prompts.";

function RadioGroup({ legend, name, options, value, onChange }: RadioGroupProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        {legend}
      </legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const checked = value === option;

          return (
            <label
              key={option}
              className={`group relative overflow-hidden rounded-[1.75rem] border px-5 py-5 transition duration-300 ${
                checked
                  ? "border-orange-400 bg-white/90 text-slate-950 shadow-[0_18px_50px_rgba(249,115,22,0.16)]"
                  : "border-white/60 bg-white/55 text-slate-700 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white/80"
              }`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_45%)] opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                    checked ? "border-orange-500" : "border-slate-400"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      checked ? "bg-fuchsia-500" : "bg-transparent"
                    }`}
                  />
                </span>
                <input
                  type="radio"
                  name={name}
                  value={option}
                  checked={checked}
                  onChange={() => onChange(option)}
                  className="sr-only"
                />
                <span className="text-lg font-semibold">{option}</span>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SetupForm({
  initialValue,
  submitLabel = "Start Analysis",
  onSubmitContext,
}: SetupFormProps) {
  const router = useRouter();
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const cursorShapeRef = useRef<HTMLDivElement>(null);
  const [typedText, setTypedText] = useState("");
  const [isInsideSetupZone, setIsInsideSetupZone] = useState(false);
  const [form, setForm] = useState<MentorContext>({
    idea: initialValue?.idea ?? "",
    stage: initialValue?.stage ?? STAGES[0],
    goal: initialValue?.goal ?? GOALS[0],
  });

  useEffect(() => {
    setForm({
      idea: initialValue?.idea ?? "",
      stage: initialValue?.stage ?? STAGES[0],
      goal: initialValue?.goal ?? GOALS[0],
    });
  }, [initialValue]);

  useEffect(() => {
    let index = 0;
    let timeoutId: number | undefined;

    function tick() {
      index += 1;
      setTypedText(HERO_COPY.slice(0, index));

      if (index >= HERO_COPY.length) {
        timeoutId = window.setTimeout(() => {
          index = 0;
          setTypedText("");
          timeoutId = window.setTimeout(tick, 220);
        }, 1200);
        return;
      }

      timeoutId = window.setTimeout(tick, 38);
    }

    timeoutId = window.setTimeout(tick, 38);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    function handlePointerMove(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (cursorGlowRef.current) {
          cursorGlowRef.current.style.transform = `translate(${event.clientX - 220}px, ${event.clientY - 220}px)`;
          cursorGlowRef.current.style.opacity = "1";
        }

        if (cursorShapeRef.current) {
          cursorShapeRef.current.style.transform = `translate(${event.clientX - 24}px, ${event.clientY - 24}px)`;
          cursorShapeRef.current.style.opacity = isInsideSetupZone ? "0" : "1";
        }
      });
    }

    function handlePointerLeave() {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.opacity = "0";
      }
      if (cursorShapeRef.current) {
        cursorShapeRef.current.style.opacity = "0";
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [isInsideSetupZone]);

  function updateField<K extends keyof MentorContext>(
    key: K,
    value: MentorContext[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextContext = {
      idea: form.idea.trim(),
      stage: form.stage,
      goal: form.goal,
    };

    if (!nextContext.idea) {
      return;
    }

    onSubmitContext?.(nextContext);

    const params = new URLSearchParams(nextContext);
    router.push(`/chat?${params.toString()}`);
  }

  return (
    <main className={`relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.22),transparent_22%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_22%),linear-gradient(180deg,#fffdf8,#fbf7ef_42%,#eff5f7)] text-slate-950 ${isInsideSetupZone ? "cursor-auto" : "cursor-none"}`}>
      <div
        ref={cursorGlowRef}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.18),rgba(56,189,248,0.10)_38%,transparent_72%)] opacity-0 blur-3xl transition-opacity duration-300"
      />
      <div
        ref={cursorShapeRef}
        className="pointer-events-none fixed left-0 top-0 z-50 h-12 w-12 opacity-0 transition-opacity duration-200"
      >
        <div className="absolute inset-0 rounded-full border border-orange-400/60 bg-white/35 shadow-[0_0_40px_rgba(249,115,22,0.16)] backdrop-blur-sm" />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_30%)]" />

      <div className="relative z-10">
        <section className="flex min-h-[92vh] items-center px-4 py-12 sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-orange-600 shadow-[0_16px_40px_rgba(249,115,22,0.10)] backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Lean Startup Mentor
              </div>

              <div className="space-y-6">
                <h1 className="font-[var(--font-heading)] text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Start with the right context
                </h1>
                <div className="max-w-4xl text-2xl leading-[1.3] text-slate-700 sm:text-3xl lg:text-4xl">
                  <span>{typedText}</span>
                  <span className="ml-1 inline-block h-[1em] w-[2px] animate-pulse bg-orange-500 align-middle" />
                </div>
              </div>
            </div>

            <a
              href="#setup-form"
              className="cursor-auto group inline-flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              Scroll to setup
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition duration-300 group-hover:translate-y-0.5">
                <ArrowDown className="h-4 w-4" />
              </span>
            </a>
          </div>
        </section>

        <section
          id="setup-form"
          className="cursor-auto px-4 pb-20 sm:px-8 lg:px-12"
          onPointerEnter={() => setIsInsideSetupZone(true)}
          onPointerLeave={() => setIsInsideSetupZone(false)}
        >
          <div className="mx-auto max-w-7xl">
            <form className="space-y-12" onSubmit={handleSubmit}>
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    What are you building?
                  </p>
                  <Input
                    id="idea"
                    placeholder="Describe your product or startup idea"
                    value={form.idea}
                    onChange={(event) => updateField("idea", event.target.value)}
                    className="h-20 rounded-[2rem] border-white/70 bg-white/75 px-7 text-xl text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur placeholder:text-slate-400 focus:border-orange-300 focus:ring-orange-200"
                  />
                </div>

                <div className="rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Why this flow works
                  </p>
                  <p className="mt-4 text-base leading-7 text-slate-700">
                    Good startup feedback depends on context. The more precise the setup,
                    the sharper the mentor can be about market reality, execution risk,
                    and next steps.
                  </p>
                </div>
              </div>

              <RadioGroup
                legend="Stage"
                name="stage"
                options={STAGES}
                value={form.stage}
                onChange={(value) => updateField("stage", value)}
              />

              <RadioGroup
                legend="Goal"
                name="goal"
                options={GOALS}
                value={form.goal}
                onChange={(value) => updateField("goal", value)}
              />

              <div className="flex flex-col gap-4 border-t border-black/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  The experience is designed to feel like a sharp, product-minded mentor,
                  not a vague chatbot. Give it a real idea and a real goal.
                </p>
                <Button
                  className="h-14 rounded-full bg-[linear-gradient(135deg,#fb923c,#f97316)] px-8 text-base text-white shadow-[0_20px_60px_rgba(249,115,22,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(249,115,22,0.28)]"
                  disabled={!form.idea.trim()}
                  type="submit"
                >
                  {submitLabel}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

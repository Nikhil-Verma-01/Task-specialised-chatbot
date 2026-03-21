"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function RadioGroup({ legend, name, options, value, onChange }: RadioGroupProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-slate-900">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const checked = value === option;

          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                checked
                  ? "border-primary bg-primary/5 text-slate-950"
                  : "border-border bg-white text-slate-600 hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="h-4 w-4 border-border text-primary focus:ring-primary"
              />
              <span className="font-medium">{option}</span>
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
  const [form, setForm] = useState<MentorContext>({
    idea: initialValue?.idea ?? "",
    stage: initialValue?.stage ?? STAGES[0],
    goal: initialValue?.goal ?? GOALS[0],
  });

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
    <section className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl border-white/70 bg-white/90 shadow-panel backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
            Lean Startup Mentor Bot
          </p>
          <CardTitle className="font-[var(--font-heading)] text-3xl text-slate-950 sm:text-4xl">
            Start with the right context
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            Share what you are building and what kind of help you need. The
            analysis starts with clear context, not vague prompts.
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="idea">
                What are you building?
              </label>
              <Input
                id="idea"
                placeholder="Describe your product or startup idea"
                value={form.idea}
                onChange={(event) => updateField("idea", event.target.value)}
              />
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

            <Button className="w-full" disabled={!form.idea.trim()} type="submit">
              {submitLabel}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

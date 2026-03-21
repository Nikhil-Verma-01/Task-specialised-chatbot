"use client";

import { type FormEvent, useState } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  isLoading: boolean;
  error: string | null;
  onSubmit: (value: string) => Promise<void>;
};

export function ChatComposer({
  isLoading,
  error,
  onSubmit,
}: ChatComposerProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValue = value.trim();
    if (!nextValue) {
      return;
    }

    setValue("");
    await onSubmit(nextValue);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Textarea
        placeholder="Ask the bot to validate your idea, find competitors, fix pricing, or get first users."
        value={value}
        disabled={isLoading}
        onChange={(event) => setValue(event.target.value)}
        className="min-h-24 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          {error || "Messages stay in local state and the latest response auto-scrolls into view."}
        </p>
        <Button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          {isLoading ? "Thinking..." : "Send"}
        </Button>
      </div>
    </form>
  );
}

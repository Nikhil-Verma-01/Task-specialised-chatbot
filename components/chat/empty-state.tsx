import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.75),rgba(2,6,23,0.98))] px-8 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-[var(--font-heading)] text-2xl font-semibold text-white">
        Start the conversation
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
        Use one of the suggestion buttons or type your first message below. The
        bot and user messages are separated clearly so the thread stays easy to scan.
      </p>
    </div>
  );
}

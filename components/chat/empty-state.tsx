import { Sparkles } from "lucide-react";

export function EmptyState({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className={theme === "dark" ? "flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.75),rgba(2,6,23,0.98))] px-8 py-12 text-center" : "flex flex-1 flex-col items-center justify-center bg-[linear-gradient(180deg,#f8fbff,#eef3f8)] px-8 py-12 text-center"}>
      <div className={theme === "dark" ? "flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "flex h-14 w-14 items-center justify-center rounded-3xl border border-sky-200 bg-sky-50 text-sky-700"}>
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className={theme === "dark" ? "mt-5 font-[var(--font-heading)] text-2xl font-semibold text-white" : "mt-5 font-[var(--font-heading)] text-2xl font-semibold text-slate-950"}>
        Start the conversation
      </h3>
      <p className={theme === "dark" ? "mt-3 max-w-xl text-sm leading-7 text-slate-400" : "mt-3 max-w-xl text-sm leading-7 text-slate-600"}>
        Use one of the suggestion buttons or type your first message below. The
        bot and user messages are separated clearly so the thread stays easy to scan.
      </p>
    </div>
  );
}

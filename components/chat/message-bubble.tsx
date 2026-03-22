import {
  AlertTriangle,
  Briefcase,
  Flag,
  Rocket,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  role: "user" | "bot";
  content: string;
  theme: "dark" | "light";
};

const SECTION_LABELS = [
  "Idea Summary",
  "Market Reality",
  "Biggest Mistake",
  "Brutal Truth",
  "Actionable Next Steps",
  "Action Steps",
] as const;

type ParsedSection = {
  heading: string;
  body: string;
};

function normalizeHeading(rawHeading: string) {
  const cleanedHeading = rawHeading
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .trim();

  if (cleanedHeading === "Actionable Next Steps") {
    return "Action Steps";
  }

  return cleanedHeading;
}

function parseBotSections(content: string): ParsedSection[] {
  const lines = content
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, index, array) => !(line === "" && array[index - 1] === ""));

  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    const normalizedLine = normalizeHeading(line);
    const isKnownHeading = SECTION_LABELS.some(
      (label) => normalizedLine.toLowerCase() === label.toLowerCase(),
    );

    if (isKnownHeading) {
      if (currentSection) {
        sections.push({
          ...currentSection,
          body: currentSection.body.trim(),
        });
      }

      currentSection = {
        heading: normalizeHeading(line),
        body: "",
      };

      continue;
    }

    if (!currentSection) {
      currentSection = {
        heading: "Idea Summary",
        body: line,
      };
      continue;
    }

    currentSection.body = currentSection.body
      ? `${currentSection.body}\n${line}`
      : line;
  }

  if (currentSection) {
    sections.push({
      ...currentSection,
      body: currentSection.body.trim(),
    });
  }

  return sections.filter((section) => section.body);
}

function splitSectionBody(body: string) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getSectionMeta(heading: string) {
  switch (heading) {
    case "Idea Summary":
      return {
        icon: Briefcase,
        accent: "from-sky-400/20 via-cyan-300/10 to-transparent",
      };
    case "Market Reality":
      return {
        icon: TrendingUp,
        accent: "from-emerald-400/20 via-teal-300/10 to-transparent",
      };
    case "Biggest Mistake":
      return {
        icon: AlertTriangle,
        accent: "from-amber-400/20 via-orange-300/10 to-transparent",
      };
    case "Brutal Truth":
      return {
        icon: Flag,
        accent: "from-rose-400/20 via-pink-300/10 to-transparent",
      };
    default:
      return {
        icon: Rocket,
        accent: "from-violet-400/20 via-fuchsia-300/10 to-transparent",
      };
  }
}

function BotResponseSections({
  content,
  theme,
}: {
  content: string;
  theme: "dark" | "light";
}) {
  const sections = parseBotSections(content);

  if (sections.length === 0) {
    return <div className="whitespace-pre-wrap break-words">{content}</div>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const meta = getSectionMeta(section.heading);
        const Icon = meta.icon;
        const bodyLines = splitSectionBody(section.body);

        return (
          <section
            key={section.heading}
            className={
              theme === "dark"
                ? "group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/55 p-4 shadow-[0_20px_50px_rgba(2,6,23,0.22)] sm:p-5"
                : "group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-[0_16px_36px_rgba(148,163,184,0.14)] sm:p-5"
            }
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100",
                meta.accent,
              )}
            />
            <div className="relative space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={
                    theme === "dark"
                      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200"
                      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sky-700"
                  }
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p
                    className={
                      theme === "dark"
                        ? "text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
                        : "text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400"
                    }
                  >
                    Mentor Section
                  </p>
                  <h4
                    className={
                      theme === "dark"
                        ? "text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200"
                        : "text-sm font-semibold uppercase tracking-[0.2em] text-sky-700"
                    }
                  >
                    {section.heading}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                {bodyLines.map((line, index) => (
                  <p
                    key={`${section.heading}-${index}`}
                    className={
                      theme === "dark"
                        ? "break-words text-[15px] leading-8 text-slate-100"
                        : "break-words text-[15px] leading-8 text-slate-700"
                    }
                  >
                    {line.replace(/^\*\*(.*?)\*\*$/, "$1")}
                  </p>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function MessageBubble({ role, content, theme }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-sm leading-7 shadow-lg sm:max-w-[75%] sm:px-5",
          isUser
            ? "rounded-br-md bg-cyan-400 text-slate-950"
            : theme === "dark"
              ? "rounded-bl-md border border-white/10 bg-slate-800/90 text-slate-100"
              : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-900 shadow-sm",
        )}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{content}</div>
        ) : (
          <BotResponseSections content={content} theme={theme} />
        )}
      </div>
    </div>
  );
}

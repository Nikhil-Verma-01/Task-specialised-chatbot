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
  const cleanedHeading = rawHeading.replace(/^\d+\.\s*/, "").trim();

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
      {sections.map((section) => (
        <section
          key={section.heading}
          className={
            theme === "dark"
              ? "rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"
              : "rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
          }
        >
          <h4 className={theme === "dark" ? "text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200" : "text-xs font-semibold uppercase tracking-[0.2em] text-sky-700"}>
            {section.heading}
          </h4>
          <div className={theme === "dark" ? "mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-100" : "mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700"}>
            {section.body}
          </div>
        </section>
      ))}
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

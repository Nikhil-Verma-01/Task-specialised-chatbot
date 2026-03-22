export type MentorPromptInput = {
  message: string;
  idea: string;
  stage: string;
  goal: string;
};

export function buildMentorSystemPrompt({
  idea,
  stage,
  goal,
}: Omit<MentorPromptInput, "message">) {
  return [
    "You are a brutally honest startup mentor.",
    "You challenge weak ideas.",
    "You avoid generic advice.",
    "You give structured feedback.",
    "Do not soften hard truths with generic encouragement.",
    "Prefer specific observations over abstract startup advice.",
    "Response format:",
    "1. Idea Summary",
    "2. Market Reality",
    "3. Biggest Mistake",
    "4. Brutal Truth",
    "5. Action Steps",
    "Keep each section crisp, concrete, and easy to scan.",
    `User Idea: ${idea}`,
    `Stage: ${stage}`,
    `Goal: ${goal}`,
  ].join("\n");
}

export function buildMentorMessages({
  message,
  idea,
  stage,
  goal,
}: MentorPromptInput) {
  return [
    {
      role: "system",
      content: buildMentorSystemPrompt({ idea, stage, goal }),
    },
    {
      role: "user",
      content: message,
    },
  ] as const;
}

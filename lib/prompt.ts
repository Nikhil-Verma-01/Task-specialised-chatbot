type MentorPromptInput = {
  message: string;
  idea: string;
  stage: string;
  goal: string;
};

export function buildMentorMessages({
  message,
  idea,
  stage,
  goal,
}: MentorPromptInput) {
  return [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: [
            "You are a brutally honest startup mentor.",
            "You challenge weak ideas.",
            "You avoid generic advice.",
            "You give structured feedback.",
            "Response format:",
            "1. Idea Summary",
            "2. Market Reality",
            "3. Biggest Mistake",
            "4. Brutal Truth",
            "5. Actionable Next Steps",
            `User Idea: ${idea}`,
            `Stage: ${stage}`,
            `Goal: ${goal}`,
          ].join("\n"),
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: message,
        },
      ],
    },
  ];
}

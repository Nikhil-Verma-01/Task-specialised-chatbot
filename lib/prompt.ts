import { ChatMessage, MentorContext } from "@/types/chat";

export function buildMentorMessages(
  context: MentorContext,
  messages: Pick<ChatMessage, "role" | "content">[],
) {
  return [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: [
            "You are a brutally honest startup mentor.",
            "Challenge weak ideas.",
            "Avoid generic advice.",
            "Give sharp, structured feedback.",
            "Do not sugarcoat.",
            "Always respond in this format:",
            "1. Idea Summary",
            "2. Market Reality",
            "3. Biggest Mistake",
            "4. Brutal Truth",
            "5. Actionable Next Steps",
            `User Idea: ${context.idea}`,
            `Stage: ${context.stage}`,
            `Goal: ${context.goal}`,
          ].join("\n"),
        },
      ],
    },
    ...messages.map((message) => ({
      role: message.role,
      content: [
        {
          type: "input_text",
          text: message.content,
        },
      ],
    })),
  ];
}

export type MentorContext = {
  idea: string;
  stage: string;
  goal: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

import { MentorChatPage } from "@/components/chat/mentor-chat-page";

type ChatPageProps = {
  searchParams: Promise<{
    idea?: string;
    stage?: string;
    goal?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;

  return (
    <MentorChatPage
      initialContext={{
        idea: params.idea ?? "",
        stage: params.stage ?? "Idea",
        goal: params.goal ?? "Validate idea",
      }}
    />
  );
}

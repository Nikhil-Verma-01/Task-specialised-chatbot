import { ChatMessage, MentorContext } from "@/types/chat";

const CONTEXT_KEY = "lean-startup-mentor-context";
const CONVERSATION_KEY = "lean-startup-mentor-conversation";

export function loadMentorContext(): MentorContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CONTEXT_KEY);
  return raw ? (JSON.parse(raw) as MentorContext) : null;
}

export function saveMentorContext(context: MentorContext | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!context) {
    window.localStorage.removeItem(CONTEXT_KEY);
    return;
  }

  window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
}

export function loadConversation(): ChatMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CONVERSATION_KEY);
  return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
}

export function saveConversation(messages: ChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONVERSATION_KEY, JSON.stringify(messages));
}

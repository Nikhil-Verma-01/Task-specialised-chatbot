import { ChatMessage, MentorContext } from "@/types/chat";

const CONTEXT_KEY = "lean-startup-mentor-context";
const CONVERSATION_KEY = "lean-startup-mentor-conversation";
const SESSION_KEY = "lean-startup-mentor-session";

type StoredChatSession = {
  context: MentorContext;
  messages: ChatMessage[];
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function loadMentorContext(): MentorContext | null {
  const session = loadChatSession();
  if (session) {
    return session.context;
  }

  return readJson<MentorContext>(CONTEXT_KEY);
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
  const session = loadChatSession();
  if (session) {
    return session.messages;
  }

  return readJson<ChatMessage[]>(CONVERSATION_KEY) || [];
}

export function saveConversation(messages: ChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONVERSATION_KEY, JSON.stringify(messages));
}

export function loadChatSession(): StoredChatSession | null {
  return readJson<StoredChatSession>(SESSION_KEY);
}

export function saveChatSession(session: StoredChatSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearChatSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONTEXT_KEY);
  window.localStorage.removeItem(CONVERSATION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}

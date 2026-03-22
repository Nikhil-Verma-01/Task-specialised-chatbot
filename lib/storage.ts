import { ChatMessage, MentorContext } from "@/types/chat";

const SESSION_STORAGE_KEY = "lean-startup-mentor-session";

export type StoredChatSession = {
  context: MentorContext;
  messages: ChatMessage[];
};

function readStorageValue<T>(key: string): T | null {
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

function isValidContext(value: unknown): value is MentorContext {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as MentorContext).idea === "string" &&
      typeof (value as MentorContext).stage === "string" &&
      typeof (value as MentorContext).goal === "string",
  );
}

function isValidMessage(value: unknown): value is ChatMessage {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as ChatMessage).id === "string" &&
      ((value as ChatMessage).role === "user" ||
        (value as ChatMessage).role === "assistant") &&
      typeof (value as ChatMessage).content === "string" &&
      typeof (value as ChatMessage).createdAt === "string",
  );
}

function isValidSession(value: unknown): value is StoredChatSession {
  return Boolean(
    value &&
      typeof value === "object" &&
      isValidContext((value as StoredChatSession).context) &&
      Array.isArray((value as StoredChatSession).messages) &&
      (value as StoredChatSession).messages.every(isValidMessage),
  );
}

export function loadChatSession(): StoredChatSession | null {
  const session = readStorageValue<unknown>(SESSION_STORAGE_KEY);

  if (!session) {
    return null;
  }

  if (!isValidSession(session)) {
    clearChatSession();
    return null;
  }

  return session;
}

export function saveChatSession(session: StoredChatSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearChatSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

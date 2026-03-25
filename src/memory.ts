import { appConfig } from "./config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// In-memory store: contactPhone → conversation history
const histories = new Map<string, ChatMessage[]>();

export function getHistory(contactPhone: string): ChatMessage[] {
  return histories.get(contactPhone) ?? [];
}

export function addMessage(contactPhone: string, message: ChatMessage): void {
  const history = histories.get(contactPhone) ?? [];
  history.push(message);

  // Keep only the last N messages to avoid unbounded growth
  const max = appConfig.agent.maxHistoryMessages;
  if (history.length > max) {
    history.splice(0, history.length - max);
  }

  histories.set(contactPhone, history);
}

export function clearHistory(contactPhone: string): void {
  histories.delete(contactPhone);
}

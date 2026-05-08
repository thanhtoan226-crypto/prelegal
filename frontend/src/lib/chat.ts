import { apiPost } from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatAPIResponse {
  message: string;
  fields: Record<string, unknown>;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  currentFields: Record<string, unknown>,
  docType: string
): Promise<ChatAPIResponse> {
  return apiPost("/api/chat", {
    messages,
    current_fields: currentFields,
    doc_type: docType,
  });
}

export function mergeFields(
  current: Record<string, unknown>,
  updates: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined) continue;
    const currentValue = result[key];
    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      typeof currentValue === "object" &&
      currentValue !== null &&
      !Array.isArray(currentValue)
    ) {
      result[key] = mergeFields(
        currentValue as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}

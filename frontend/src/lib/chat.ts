import { NDAFormData, PartyInfo } from "./types";
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
  currentFields: NDAFormData
): Promise<ChatAPIResponse> {
  return apiPost("/api/chat", {
    messages,
    current_fields: currentFields,
  });
}

export function mergeFields(
  current: NDAFormData,
  updates: Record<string, unknown>
): NDAFormData {
  const result = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined) continue;
    if (key === "party1" || key === "party2") {
      const partyUpdates = value as Partial<PartyInfo>;
      const currentParty = { ...current[key] };
      for (const [pk, pv] of Object.entries(partyUpdates)) {
        if (pv !== null && pv !== undefined) {
          (currentParty as Record<string, string>)[pk] = pv as string;
        }
      }
      result[key] = currentParty;
    } else {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

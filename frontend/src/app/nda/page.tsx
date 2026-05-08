"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";
import NDAPreview from "@/components/NDAPreview";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NDAFormData, createDefaultFormData } from "@/lib/types";
import { ChatMessage, sendChatMessage, mergeFields } from "@/lib/chat";

function NDACreatorContent() {
  const [formData, setFormData] = useState<NDAFormData>(createDefaultFormData);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setIsLoading(true);
    sendChatMessage([], createDefaultFormData())
      .then((res) => {
        setMessages([{ role: "assistant", content: res.message }]);
        if (res.fields && Object.keys(res.fields).length > 0) {
          setFormData((prev) => mergeFields(prev, res.fields));
        }
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Hi! I'll help you create a Mutual Non-Disclosure Agreement. Something went wrong connecting to the AI service. Please try again.",
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      if (isLoading) return;

      const userMessage: ChatMessage = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const res = await sendChatMessage(updatedMessages, formData);
        setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);
        if (res.fields && Object.keys(res.fields).length > 0) {
          setFormData((prev) => mergeFields(prev, res.fields));
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I had trouble processing that. Could you try again?",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, formData, isLoading]
  );

  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold hover:opacity-80 transition-opacity"
          style={{ color: "#209dd7" }}
        >
          Prelegal
        </Link>
        <h1 className="text-sm font-medium text-gray-600">Mutual NDA Creator</h1>
        <button
          className="md:hidden px-3 py-1.5 text-sm rounded-md text-white"
          style={{ backgroundColor: "#753991" }}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Chat" : "Preview"}
        </button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        <div className={`md:w-1/2 min-h-0 ${showPreview ? "hidden md:flex" : "flex flex-col"}`}>
          <ChatPanel messages={messages} onSend={handleSend} isLoading={isLoading} />
        </div>
        <div
          className={`md:w-1/2 overflow-y-auto p-6 border-l border-gray-200 ${
            showPreview ? "" : "hidden md:block"
          }`}
        >
          <NDAPreview data={formData} />
        </div>
      </div>
    </div>
  );
}

export default function NDACreator() {
  return (
    <ProtectedRoute>
      <NDACreatorContent />
    </ProtectedRoute>
  );
}

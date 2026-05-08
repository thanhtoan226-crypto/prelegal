"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import DocumentPreview from "@/components/DocumentPreview";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChatMessage, sendChatMessage, mergeFields } from "@/lib/chat";
import { fetchDocType, renderDocument, DocTypeMeta } from "@/lib/docApi";

function DocCreatorContent() {
  const params = useParams();
  const docType = params.docType as string;
  const [meta, setMeta] = useState<DocTypeMeta | null>(null);
  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [pdfHtml, setPdfHtml] = useState("");
  const initializedRef = useRef(false);
  const renderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    fetchDocType(docType)
      .then((m) => {
        setMeta(m);
        setIsLoading(true);
        return sendChatMessage([], {}, docType);
      })
      .then((res) => {
        setMessages([{ role: "assistant", content: res.message }]);
        if (res.fields && Object.keys(res.fields).length > 0) {
          setFields((prev) => mergeFields(prev, res.fields));
        }
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content: "Hi! Something went wrong connecting to the AI service. Please try again.",
          },
        ]);
      })
      .finally(() => setIsLoading(false));
  }, [docType]);

  useEffect(() => {
    if (!meta) return;
    if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);

    renderTimeoutRef.current = setTimeout(() => {
      renderDocument(docType, fields)
        .then((result) => {
          setMarkdown(result.markdown);
          setPdfHtml(result.html);
        })
        .catch(() => {});
    }, 300);

    return () => {
      if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    };
  }, [fields, docType, meta]);

  const handleSend = useCallback(
    async (content: string) => {
      if (isLoading) return;

      const userMessage: ChatMessage = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const res = await sendChatMessage(updatedMessages, fields, docType);
        setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);
        if (res.fields && Object.keys(res.fields).length > 0) {
          setFields((prev) => mergeFields(prev, res.fields));
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
    [messages, fields, isLoading, docType]
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
        <h1 className="text-sm font-medium text-gray-600">
          {meta ? meta.name : "Loading..."}
        </h1>
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
          <DocumentPreview
            markdown={markdown}
            pdfHtml={pdfHtml}
            docName={meta?.slug || docType}
          />
        </div>
      </div>
    </div>
  );
}

export default function DocCreatorClient() {
  return (
    <ProtectedRoute>
      <DocCreatorContent />
    </ProtectedRoute>
  );
}

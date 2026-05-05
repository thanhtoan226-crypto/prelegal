"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { NDAFormData } from "@/lib/types";
import { generateFullDocument } from "@/lib/template";

interface Props {
  data: NDAFormData;
}

export default function NDAPreview({ data }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const markdown = generateFullDocument(data);

  const handleDownload = async () => {
    if (!previewRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: [15, 15, 15, 15],
          filename: "Mutual-NDA.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(previewRef.current)
        .save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Document Preview</h2>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
        >
          {downloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>
      <div
        ref={previewRef}
        className="prose prose-sm max-w-none bg-white p-8 rounded-lg border border-gray-200 overflow-y-auto flex-1 shadow-inner"
      >
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}

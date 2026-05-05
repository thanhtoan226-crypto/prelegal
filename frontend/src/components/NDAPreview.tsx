"use client";

import { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { NDAFormData } from "@/lib/types";
import { generateFullDocument } from "@/lib/template";

interface Props {
  data: NDAFormData;
}

export default function NDAPreview({ data }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const markdown = generateFullDocument(data);

  const handleDownload = async () => {
    if (!previewRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 15;

      pdf.addImage(imgData, "JPEG", 15, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 30;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 15;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 15, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 30;
      }

      pdf.save("Mutual-NDA.pdf");
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
          disabled={downloading || !ready}
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

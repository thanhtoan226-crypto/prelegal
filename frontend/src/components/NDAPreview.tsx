"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { NDAFormData } from "@/lib/types";
import { generateFullDocument, generatePdfHtml } from "@/lib/template";

interface Props {
  data: NDAFormData;
}

export default function NDAPreview({ data }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const markdown = generateFullDocument(data);
  const pdfHtml = generatePdfHtml(data);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Create a temporary off-screen container with clean inline styles
      // This avoids html2canvas parsing Tailwind CSS var() which causes crashes
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "794px"; // A4 width at 96dpi
      container.style.background = "white";
      container.innerHTML = pdfHtml;
      document.body.appendChild(container);
      pdfContainerRef.current = container;

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);
      pdfContainerRef.current = null;

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
      // Clean up the temp container if it still exists
      if (pdfContainerRef.current && pdfContainerRef.current.parentNode) {
        pdfContainerRef.current.parentNode.removeChild(pdfContainerRef.current);
        pdfContainerRef.current = null;
      }
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [downloading, pdfHtml]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Document Preview</h2>
        <button
          onClick={handleDownload}
          disabled={downloading || !ready}
          className="px-4 py-2 text-white rounded-md disabled:opacity-50 text-sm font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: "#753991" }}
          onMouseEnter={(e) => !downloading && (e.currentTarget.style.backgroundColor = "#5f2d75")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#753991")}
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

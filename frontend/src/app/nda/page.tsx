"use client";

import { useState } from "react";
import Link from "next/link";
import NDAForm from "@/components/NDAForm";
import NDAPreview from "@/components/NDAPreview";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NDAFormData, createDefaultFormData } from "@/lib/types";

function NDACreatorContent() {
  const [formData, setFormData] = useState<NDAFormData>(createDefaultFormData);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold hover:opacity-80 transition-opacity" style={{ color: "#209dd7" }}>
          Prelegal
        </Link>
        <h1 className="text-sm font-medium text-gray-600">Mutual NDA Creator</h1>
        <button
          className="md:hidden px-3 py-1.5 text-sm rounded-md text-white"
          style={{ backgroundColor: "#753991" }}
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Edit Form" : "Preview"}
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`md:w-1/2 overflow-y-auto p-6 ${showPreview ? "hidden md:block" : ""}`}>
          <NDAForm data={formData} onChange={setFormData} />
        </div>
        <div className={`md:w-1/2 overflow-y-auto p-6 border-l border-gray-200 ${showPreview ? "" : "hidden md:block"}`}>
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

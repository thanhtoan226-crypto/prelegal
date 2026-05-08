"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchCatalog, CatalogItem } from "@/lib/docApi";

function HomeContent() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog()
      .then(setCatalog)
      .catch(() => setCatalog([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/signin");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-bold" style={{ color: "#209dd7" }}>
          Prelegal
        </span>
        <button
          onClick={handleSignOut}
          className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Sign Out
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="max-w-3xl w-full text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#032147" }}>
            Prelegal
          </h1>
          <p className="text-lg" style={{ color: "#888888" }}>
            Draft common legal agreements quickly and easily.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading document types...</p>
        ) : (
          <div className="max-w-3xl w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {catalog.map((item) => (
              <Link
                key={item.slug}
                href={`/create/${item.slug}`}
                className="block rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h2
                  className="text-base font-semibold mb-1"
                  style={{ color: "#032147" }}
                >
                  {item.name}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

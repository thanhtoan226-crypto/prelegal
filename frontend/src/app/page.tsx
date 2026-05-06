"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function HomeContent() {
  const router = useRouter();
  const { signOut } = useAuth();

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

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#032147" }}>
            Prelegal
          </h1>
          <p className="text-lg" style={{ color: "#888888" }}>
            Draft common legal agreements quickly and easily.
          </p>
          <div className="space-y-3">
            <Link
              href="/nda"
              className="block w-full rounded-lg px-6 py-3 text-white font-medium transition-colors"
              style={{ backgroundColor: "#753991" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5f2d75")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#753991")}
            >
              Create a Mutual NDA with AI
            </Link>
          </div>
        </div>
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

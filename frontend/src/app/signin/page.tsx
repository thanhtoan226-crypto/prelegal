"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    await signIn();
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#032147" }}>
            Prelegal
          </h1>
          <p className="mt-3 text-lg" style={{ color: "#888888" }}>
            Draft common legal agreements quickly and easily.
          </p>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full rounded-lg px-6 py-3 text-white font-medium transition-colors cursor-pointer"
          style={{ backgroundColor: "#753991" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5f2d75")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#753991")}
        >
          Sign In
        </button>

        <p className="text-sm" style={{ color: "#888888" }}>
          Welcome to the Prelegal preview.
        </p>
      </div>
    </div>
  );
}

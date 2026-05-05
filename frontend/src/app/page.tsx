import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Prelegal
        </h1>
        <p className="text-lg text-gray-600">
          Draft common legal agreements quickly and easily.
        </p>
        <div className="space-y-3">
          <Link
            href="/nda"
            className="block w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            Create a Mutual NDA
          </Link>
        </div>
      </div>
    </div>
  );
}

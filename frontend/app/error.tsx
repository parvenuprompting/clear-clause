"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ClearClause UI error", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <section className="max-w-lg text-center space-y-5">
        <p className="text-cyan-400 text-sm uppercase tracking-widest">ClearClause</p>
        <h1 className="text-3xl font-semibold">Er ging iets mis</h1>
        <p className="text-white/60">
          Deze pagina kon niet worden geladen. Probeer het opnieuw of ga terug naar de homepage.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-cyan-500 px-4 py-2 font-medium text-black hover:bg-cyan-400"
          >
            Opnieuw proberen
          </button>
          <Link
            href="/"
            className="rounded-lg border border-white/20 px-4 py-2 font-medium text-white hover:bg-white/10"
          >
            Naar home
          </Link>
        </div>
      </section>
    </main>
  );
}

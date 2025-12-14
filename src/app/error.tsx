"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js App Router error boundary
 * Catches errors in the app directory and displays a fallback UI
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error("App error:", error);

    // In production, send to error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F0E6]">
      <div className="text-center max-w-md">
        <div className="border-2 border-black p-8">
          <h2 className="text-2xl font-[family-name:var(--font-cormorant)] italic text-black mb-4">
            Something went wrong
          </h2>
          <p className="text-black/70 mb-6">
            We encountered an unexpected error. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            Try Again
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left text-sm text-black/60">
            <summary className="cursor-pointer hover:text-black">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 p-4 bg-black/5 overflow-auto text-xs">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

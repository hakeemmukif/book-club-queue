"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

interface RegistrationDetails {
  registration: {
    id: string;
    name: string;
    status: string;
    position: number | null;
  };
  event: {
    id: string;
    title: string;
    bookTitle: string;
    bookAuthor: string | null;
    date: string;
    location: string;
  };
  canCancel: boolean;
}

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No cancellation token provided");
      setLoading(false);
      return;
    }

    async function fetchDetails() {
      try {
        const res = await fetch(`/api/registrations/cancel?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load registration");
          return;
        }

        setDetails(data);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("Failed to load registration details");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [token]);

  const handleCancel = async () => {
    if (!token) return;

    setCancelling(true);
    setError(null);

    try {
      const res = await fetch("/api/registrations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to cancel registration");
        return;
      }

      setCancelled(true);
    } catch (err) {
      console.error("Error cancelling:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (cancelled) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your spot has been released. Thank you for letting us know!
          </p>
          <Link href="/events" className="btn-primary inline-block">
            View Other Events
          </Link>
        </div>
      </main>
    );
  }

  if (error || !details) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">
            {error || "This cancellation link is invalid or has expired."}
          </p>
          <Link href="/" className="btn-primary inline-block">
            Go to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-xl">{SITE_NAME}</span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Cancel Registration</h1>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">{details.event.title}</h2>
            <p className="text-primary-600 font-medium mb-2">
              {details.event.bookTitle}
              {details.event.bookAuthor && (
                <span className="text-gray-500"> by {details.event.bookAuthor}</span>
              )}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{formatDate(details.event.date)}</p>
              <p>{details.event.location}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {details.registration.name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Status:</span>{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-green-100 text-green-800">
                Confirmed
              </span>
            </p>
          </div>

          {!details.canCancel ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This event has already passed. You cannot cancel this registration.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <p className="text-yellow-800 text-sm">
                  Are you sure you want to cancel? Your spot will be released.
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  href={`/event/${details.event.id}`}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-center text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Keep My Spot
                </Link>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Registration"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </main>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CancelContent />
    </Suspense>
  );
}

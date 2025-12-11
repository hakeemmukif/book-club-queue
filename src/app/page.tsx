"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout";

// Dynamically import BookScene to avoid SSR issues with Three.js
const BookScene = dynamic(
  () => import("@/components/three/BookScene").then((mod) => mod.BookScene),
  { ssr: false }
);

// Hardcoded event data for now
const EVENT_DATA = {
  id: "dec-14-2024",
  title: "December 14 Selection",
  bookTitle: "The End Of Loneliness",
  bookAuthor: "Benedict Wells",
  date: "December 14",
  time: "3:00 PM GMT+8",
  totalSpots: 12,
  spotsLeft: 12,
};

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagramHandle: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Simulate submission for now
    // TODO: Connect to actual API when ready
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({ name: "", email: "", instagramHandle: "" });
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Three.js Canvas */}
      <BookScene />

      {/* Content */}
      <div className="relative z-10 h-screen overflow-hidden" style={{ pointerEvents: "none" }}>
        <Header />

        <main className="h-[calc(100vh-80px)] flex items-center px-8 md:px-16">
          <div className="max-w-xl" style={{ pointerEvents: "auto" }}>
            {/* Event Label */}
            <p className="section-label animate-fade-up">
              {EVENT_DATA.title.toUpperCase()}
            </p>

            {/* Book Title */}
            <h1 className="book-title glow-text animate-fade-up-delay-1">
              {EVENT_DATA.bookTitle}
            </h1>

            {/* Author */}
            <p className="text-lg text-white/60 mb-8 animate-fade-up-delay-1">
              by {EVENT_DATA.bookAuthor}
            </p>

            {/* Event Details */}
            <div className="meeting-info mb-8 animate-fade-up-delay-2">
              <div className="meeting-item">
                <span className="meeting-label">Date</span>
                <span className="meeting-value">{EVENT_DATA.date}</span>
              </div>
              <div className="meeting-item">
                <span className="meeting-label">Time</span>
                <span className="meeting-value">{EVENT_DATA.time}</span>
              </div>
              <div className="meeting-item">
                <span className="meeting-label">Spots Left</span>
                <span className="meeting-value">
                  {EVENT_DATA.spotsLeft} / {EVENT_DATA.totalSpots}
                </span>
              </div>
            </div>

            {/* Inline Registration Form */}
            {!success ? (
              <form onSubmit={handleSubmit} className="animate-fade-up-delay-3">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="form-label">
                    Instagram <span className="text-white/30">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="yourhandle"
                      className="form-input pl-8"
                      value={formData.instagramHandle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instagramHandle: e.target.value.replace(/^@/, ""),
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="cta-button w-full sm:w-auto justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Reserve Your Seat
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="animate-fade-in p-6 bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">You&apos;re In!</span>
                </div>
                <p className="text-white/60 text-sm">
                  We&apos;ve reserved your seat. See you on {EVENT_DATA.date}!
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Register another person
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

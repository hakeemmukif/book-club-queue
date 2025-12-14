"use client";

import { useState, useRef } from "react";

const EVENT_DATA = {
  id: "cmj4radio002event",  // Database event ID
  title: "EAT BOOKS RADIO",
  episode: "002",
  tagline: "",
  djs: ["MALAYGIRLDIGITAL", "EDEN"],
  date: "11 JANUARY 2026",
  day: "SUNDAY",
  time: "4PM - 8PM",
  location: "SOSOHUB, PJ",
  locationUrl: "https://maps.app.goo.gl/u3hV5NnQRMpXKDvH7",
  ticket: "RM35",
  ticketNote: "includes 1 Soso Signature Drink",
  totalSpots: 40,
  spotsLeft: 40,
  description:
    "A 2-hour live DJ experience featuring bubblegum bass, nusantara bounce, psychedelic pop, baile funk, jersey club, and miami bass.",
};

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagramHandle: "",
    confirmAttendance: false,
    understandDrinkMenu: false,
    pledgeNotToBail: false,
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (
      !formData.confirmAttendance ||
      !formData.understandDrinkMenu ||
      !formData.pledgeNotToBail
    ) {
      setError("Please confirm all required checkboxes.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/events/${EVENT_DATA.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          instagramHandle: formData.instagramHandle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        instagramHandle: "",
        confirmAttendance: false,
        understandDrinkMenu: false,
        pledgeNotToBail: false,
      });
      setReceiptFile(null);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="cream-page flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="border-2 border-black p-8 mb-6">
            <h2 className="text-2xl font-[family-name:var(--font-cormorant)] italic text-black mb-4">
              You&apos;re In!
            </h2>
            <p className="text-black/70 mb-2">
              Your spot is secured. See you on {EVENT_DATA.date}!
            </p>
            <p className="text-black/50 text-sm">
              Can&apos;t wait to groove together!
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-sm text-black/50 hover:text-black underline underline-offset-4"
          >
            Register another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cream-page">
      {/* Header Banner Image */}
      <div className="w-full">
        <img
          src="/ebr-header.png"
          alt="EAT BOOKS RADIO 002 - 11 January 2026, 4PM-8PM at SosoHub PJ. Sounds by MALAYGIRLDIGITAL and EDEN"
          className="w-full h-auto object-cover"
        />
      </div>

      <main className="max-w-xl mx-auto px-6 py-12">
        {/* Episode Title */}
        <h1 className="text-2xl md:text-3xl font-[family-name:var(--font-cormorant)] tracking-wide text-black mb-2">
          {EVENT_DATA.title}: {EVENT_DATA.episode}
        </h1>

        {/* Featuring Line */}
        <p className="text-black/70 mb-8">featuring {EVENT_DATA.djs.join(" & ")}</p>

        {/* Tagline */}
        {EVENT_DATA.tagline && (
          <p className="text-xl md:text-2xl font-[family-name:var(--font-cormorant)] italic text-left mb-8">
            &ldquo;{EVENT_DATA.tagline}&rdquo;
          </p>
        )}

        {/* Description Box */}
        <div className="sketch-box p-6 mb-10 bg-transparent">
          <p className="text-black/80 leading-relaxed">{EVENT_DATA.description}</p>
        </div>

        {/* Ticket Info */}
        <div className="text-left mb-10">
          <p className="text-3xl font-[family-name:var(--font-cormorant)]">{EVENT_DATA.ticket}</p>
          <p className="text-sm text-black/60 mt-1">{EVENT_DATA.ticketNote}</p>
        </div>

        {/* RSVP Section */}
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-medium text-black mb-6 pb-2 border-b-2 border-black">
            RSVP
          </h2>

          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-400 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs tracking-[0.15em] mb-2">NAME</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="cream-input"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] mb-2">EMAIL</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="cream-input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.15em] mb-2">INSTAGRAM HANDLE</label>
              <input
                type="text"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                className="cream-input"
                placeholder="@yourhandle"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.confirmAttendance}
                onChange={(e) =>
                  setFormData({ ...formData, confirmAttendance: e.target.checked })
                }
                className="cream-checkbox mt-0.5"
              />
              <span className="text-black/70 group-hover:text-black transition-colors text-sm">
                By filling this form, I confirm my attendance.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.understandDrinkMenu}
                onChange={(e) =>
                  setFormData({ ...formData, understandDrinkMenu: e.target.checked })
                }
                className="cream-checkbox mt-0.5"
              />
              <span className="text-black/70 group-hover:text-black transition-colors text-sm">
                I understand my ticket includes 1 Soso Signature Drink.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.pledgeNotToBail}
                onChange={(e) =>
                  setFormData({ ...formData, pledgeNotToBail: e.target.checked })
                }
                className="cream-checkbox mt-0.5"
              />
              <span className="text-black/70 group-hover:text-black transition-colors text-sm">
                I pledge to not bail.
              </span>
            </label>
          </div>

          {/* Upload Receipt */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.15em] mb-3">UPLOAD RECEIPT</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />
            <div
              onClick={handleUploadClick}
              className="upload-box"
            >
              {receiptFile ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-600"
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
                  <span className="text-black/80">{receiptFile.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-8 h-8 text-black/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span className="text-black/50 text-sm">
                    Click to upload
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="cream-submit w-full"
          >
            {submitting ? "Submitting..." : "SUBMIT"}
          </button>
        </form>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-black text-center">
          <p className="text-xs tracking-[0.2em] text-black/50">
            EAT BOOKS CLUB
          </p>
        </footer>
      </main>
    </div>
  );
}

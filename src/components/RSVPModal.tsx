"use client";

import { useState } from "react";
import Link from "next/link";
import { EventWithStats } from "@/types";
import { generateGoogleCalendarUrl, generateICSContent } from "@/lib/utils";
import { SITE_URL, REGISTRATION_STATUS } from "@/lib/constants";

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventWithStats;
  onSuccess: () => void;
}

interface RegistrationSuccess {
  status: string;
  position?: number;
  message: string;
  cancelToken: string;
}

export function RSVPModal({ isOpen, onClose, event, onSuccess }: RSVPModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<RegistrationSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagramHandle: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess({
        status: data.registration.status,
        position: data.registration.position,
        message: data.message,
        cancelToken: data.registration.cancelToken,
      });

      onSuccess();
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl({
      title: `${event.title} - ${event.bookTitle}`,
      description:
        event.description ||
        `Book club meeting: ${event.bookTitle}${event.bookAuthor ? ` by ${event.bookAuthor}` : ""}`,
      location: event.location,
      date: event.date,
    });
    window.open(url, "_blank");
  };

  const handleAddToAppleCalendar = () => {
    const icsContent = generateICSContent({
      title: `${event.title} - ${event.bookTitle}`,
      description:
        event.description ||
        `Book club meeting: ${event.bookTitle}${event.bookAuthor ? ` by ${event.bookAuthor}` : ""}`,
      location: event.location,
      date: event.date,
    });
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCancelUrl = () => {
    if (!success?.cancelToken) return "";
    return `${SITE_URL}/cancel?token=${success.cancelToken}`;
  };

  const handleClose = () => {
    if (!submitting) {
      setSuccess(null);
      setError(null);
      setFormData({ name: "", email: "", instagramHandle: "" });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isOpen ? "active" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal relative" style={{ pointerEvents: "auto" }}>
        <button
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:border-white transition-all duration-300 hover:rotate-90"
          onClick={handleClose}
          disabled={submitting}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {success ? (
          <div className="animate-fade-in">
            <div
              className={`mb-6 ${
                success.status === REGISTRATION_STATUS.CONFIRMED
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {success.status === REGISTRATION_STATUS.CONFIRMED ? (
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <h3 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-2">
              You&apos;re In
            </h3>

            <p className="text-white/60 text-sm mb-8">{success.message}</p>

            <div className="space-y-3 mb-8">
                <button
                  onClick={handleAddToGoogleCalendar}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25zM4.5 6.75V4.5h15v2.25h-15z" />
                  </svg>
                  Add to Google Calendar
                </button>
                <button
                  onClick={handleAddToAppleCalendar}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25zM4.5 6.75V4.5h15v2.25h-15z" />
                  </svg>
                  Download .ics (Apple Calendar)
                </button>
              </div>

            <p className="text-xs text-white/40">
              Need to cancel?{" "}
              <Link href={getCancelUrl()} className="text-white/60 hover:text-white underline">
                Click here
              </Link>
            </p>
          </div>
        ) : (
          <>
            <h3 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-2">
              Reserve Your Seat
            </h3>
            <p className="text-sm text-white/50 mb-8 tracking-wide">
              {event.bookTitle}
              {event.bookAuthor && ` by ${event.bookAuthor}`}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your name"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@email.com"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Instagram Handle{" "}
                  <span className="text-white/30">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    @
                  </span>
                  <input
                    type="text"
                    name="instagram"
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
                className="submit-btn flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Registration"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

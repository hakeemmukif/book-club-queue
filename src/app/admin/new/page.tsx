"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/components/AdminAuth";

export default function NewEventPage() {
  const router = useRouter();
  const { password } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    bookTitle: "",
    bookAuthor: "",
    location: "",
    date: "",
    totalSpots: 10,
    waitlistEnabled: true,
    waitlistLimit: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          ...formData,
          waitlistLimit: formData.waitlistLimit
            ? parseInt(formData.waitlistLimit)
            : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }

      const event = await res.json();
      router.push(`/admin/event/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Events
        </Link>
      </div>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., December Book Club Meeting"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title *
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g., The Great Gatsby"
                value={formData.bookTitle}
                onChange={(e) =>
                  setFormData({ ...formData, bookTitle: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Author
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., F. Scott Fitzgerald"
                value={formData.bookAuthor}
                onChange={(e) =>
                  setFormData({ ...formData, bookAuthor: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Coffee House, 123 Main St"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              className="input-field"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Spots *
            </label>
            <input
              type="number"
              required
              min="1"
              max="1000"
              className="input-field"
              value={formData.totalSpots}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalSpots: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>

          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="waitlistEnabled"
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={formData.waitlistEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, waitlistEnabled: e.target.checked })
                }
              />
              <label htmlFor="waitlistEnabled" className="text-gray-700">
                Enable waitlist when event is full
              </label>
            </div>

            {formData.waitlistEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waitlist Limit (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="input-field"
                  placeholder="Unlimited"
                  value={formData.waitlistLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, waitlistLimit: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              className="input-field resize-none"
              placeholder="Add any additional details about the event..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <Link href="/admin" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/components/AdminAuth";

interface Props {
  params: { id: string };
}

export default function EditEventPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const { password } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    bookTitle: "",
    bookAuthor: "",
    location: "",
    date: "",
    totalSpots: 10,
    description: "",
    isActive: true,
  });

  const [registeredCount, setRegisteredCount] = useState(0);

  // Fetch existing event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          throw new Error("Event not found");
        }
        const event = await res.json();

        // Format date for datetime-local input
        const eventDate = new Date(event.date);
        const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);

        setFormData({
          title: event.title || "",
          bookTitle: event.bookTitle || "",
          bookAuthor: event.bookAuthor || "",
          location: event.location || "",
          date: localDate,
          totalSpots: event.totalSpots || 10,
          description: event.description || "",
          isActive: event.isActive ?? true,
        });
        setRegisteredCount(event.confirmedCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate totalSpots is not less than registered count
    if (formData.totalSpots < registeredCount) {
      setError(`Cannot reduce spots below ${registeredCount} (current registrations)`);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update event");
      }

      router.push(`/admin/event/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/admin/event/${id}`}
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
          Back to Event
        </Link>
      </div>

      <div className="card p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Event</h1>
        <p className="text-sm text-gray-500 mb-6">
          {registeredCount} registration{registeredCount !== 1 ? "s" : ""} will not be affected
        </p>

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
              min={registeredCount || 1}
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
            {registeredCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum {registeredCount} (current registrations)
              </p>
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Event is active (accepting registrations)
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href={`/admin/event/${id}`} className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

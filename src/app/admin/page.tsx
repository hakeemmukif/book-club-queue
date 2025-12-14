"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminAuth";
import { EventWithStats } from "@/types";

export default function AdminDashboard() {
  const { password } = useAdmin();
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (eventId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to toggle event:", error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This will also delete all registrations.")) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const copyEventUrl = (eventId: string) => {
    const url = `${window.location.origin}/event/${eventId}`;
    navigator.clipboard.writeText(url);
    alert("Event URL copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link href="/admin/new" className="btn-primary">
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No events yet</h3>
          <p className="mt-2 text-gray-500">
            Create your first book club event to get started.
          </p>
          <Link href="/admin/new" className="btn-primary mt-6 inline-block">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {event.title}
                    </h2>
                    <span
                      className={`badge ${
                        event.isActive ? "badge-success" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {event.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-primary-600 font-medium mb-2">
                    {event.bookTitle}
                    {event.bookAuthor && (
                      <span className="text-gray-500"> by {event.bookAuthor}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{formatDate(event.date)}</span>
                    <span>{event.location}</span>
                    <span>
                      {event.confirmedCount}/{event.totalSpots} confirmed
                      {event.waitlistCount > 0 && (
                        <span className="text-yellow-600">
                          {" "}
                          + {event.waitlistCount} waitlist
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => copyEventUrl(event.id)}
                    className="text-sm py-2 px-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    title="Copy event URL"
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
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <Link
                    href={`/admin/event/${event.id}`}
                    className="text-sm py-2 px-3 rounded-lg font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => toggleActive(event.id, event.isActive)}
                    className={`text-sm py-2 px-3 rounded-lg font-medium transition-colors ${
                      event.isActive
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {event.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-sm py-2 px-3 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

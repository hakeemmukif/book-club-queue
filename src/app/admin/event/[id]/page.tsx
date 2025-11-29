"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminAuth";
import { EventWithStats, RegistrationWithEvent } from "@/types";

interface Props {
  params: { id: string };
}

export default function AdminEventPage({ params }: Props) {
  const { id } = params;
  const { password } = useAdmin();
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [eventRes, regRes] = await Promise.all([
        fetch(`/api/events/${id}`),
        fetch(`/api/events/${id}/registrations`, {
          headers: { "x-admin-password": password },
        }),
      ]);

      if (!eventRes.ok) {
        setError("Event not found");
        return;
      }

      setEvent(await eventRes.json());
      if (regRes.ok) {
        setRegistrations(await regRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [id, password]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const removeRegistration = async (registrationId: string) => {
    if (!confirm("Remove this registration?")) return;

    try {
      const res = await fetch(`/api/events/${id}/registrations`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ registrationId }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to remove registration:", err);
    }
  };

  const copyEventUrl = () => {
    const url = `${window.location.origin}/event/${id}`;
    navigator.clipboard.writeText(url);
    alert("Event URL copied to clipboard!");
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">{error || "Event not found"}</h1>
        <Link href="/admin" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to events
        </Link>
      </div>
    );
  }

  const confirmedRegs = registrations.filter((r) => r.status === "confirmed");
  const waitlistRegs = registrations.filter((r) => r.status === "waitlist");

  return (
    <div>
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

      {/* Event Details */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <span
                className={`badge ${
                  event.isActive ? "badge-success" : "bg-gray-100 text-gray-600"
                }`}
              >
                {event.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-lg text-primary-600 font-medium">
              {event.bookTitle}
              {event.bookAuthor && (
                <span className="text-gray-500"> by {event.bookAuthor}</span>
              )}
            </p>
          </div>
          <button onClick={copyEventUrl} className="btn-outline whitespace-nowrap">
            Copy Event URL
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Date & Time</p>
            <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Location</p>
            <p className="font-medium text-gray-900">{event.location}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Confirmed</p>
            <p className="font-medium text-gray-900">
              {event.confirmedCount} / {event.totalSpots}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Waitlist</p>
            <p className="font-medium text-gray-900">
              {event.waitlistCount}
              {event.waitlistLimit && ` / ${event.waitlistLimit}`}
            </p>
          </div>
        </div>

        {event.description && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-gray-900">{event.description}</p>
          </div>
        )}
      </div>

      {/* Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Confirmed */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Confirmed ({confirmedRegs.length})
            </h2>
          </div>
          {confirmedRegs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No confirmed registrations yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {confirmedRegs.map((reg, index) => (
                <div
                  key={reg.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{reg.name}</p>
                      <a
                        href={`https://instagram.com/${reg.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        @{reg.instagramHandle}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      {formatShortDate(reg.createdAt)}
                    </span>
                    <button
                      onClick={() => removeRegistration(reg.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove registration"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waitlist */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Waitlist ({waitlistRegs.length})
            </h2>
          </div>
          {waitlistRegs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No one on the waitlist
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {waitlistRegs.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-sm font-medium">
                      #{reg.position}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{reg.name}</p>
                      <a
                        href={`https://instagram.com/${reg.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        @{reg.instagramHandle}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                      {formatShortDate(reg.createdAt)}
                    </span>
                    <button
                      onClick={() => removeRegistration(reg.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove registration"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

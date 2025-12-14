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
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

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

  const viewReceipt = async (registrationId: string) => {
    // Check if we already have the receipt URL cached
    const reg = registrations.find(r => r.id === registrationId);
    if (reg?.receiptUrl) {
      setSelectedReceipt(reg.receiptUrl);
      return;
    }

    // Fetch single receipt from dedicated endpoint
    setLoadingReceipt(true);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/receipt`, {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const data = await res.json();
        // Cache the receipt in local state
        setRegistrations(prev => prev.map(r =>
          r.id === registrationId ? { ...r, receiptUrl: data.receiptUrl } : r
        ));
        setSelectedReceipt(data.receiptUrl);
      }
    } catch (err) {
      console.error("Failed to fetch receipt:", err);
    } finally {
      setLoadingReceipt(false);
    }
  };

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
            <p className="text-sm text-gray-500 mb-1">Registered</p>
            <p className="font-medium text-gray-900">
              {event.confirmedCount} / {event.totalSpots}
            </p>
          </div>
        </div>

        {event.description && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-gray-900">{event.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
          <Link
            href={`/admin/event/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Event
          </Link>
          <button
            onClick={copyEventUrl}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Event URL
          </button>
        </div>
      </div>

      {/* Registrations */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Registrations ({confirmedRegs.length})
          </h2>
        </div>
        {confirmedRegs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No registrations yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {confirmedRegs.map((reg, index) => (
              <div
                key={reg.id}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">{reg.name}</p>
                        <span className="text-xs text-gray-400">
                          {formatShortDate(reg.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <a
                          href={`mailto:${reg.email}`}
                          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {reg.email}
                        </a>
                        {reg.instagramHandle && (
                          <a
                            href={`https://instagram.com/${reg.instagramHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            @{reg.instagramHandle}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(reg.hasReceipt || reg.receiptUrl) && (
                      <button
                        onClick={() => viewReceipt(reg.id)}
                        disabled={loadingReceipt}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors disabled:opacity-50"
                        title="View receipt"
                      >
                        {loadingReceipt ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => removeRegistration(reg.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-auto bg-white rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors"
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={selectedReceipt}
              alt="Payment Receipt"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

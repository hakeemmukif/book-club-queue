"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventWithStats } from "@/types";

interface Props {
  params: { id: string };
}

export default function EventPage({ params }: Props) {
  const { id } = params;
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    status: string;
    position?: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    instagramHandle: "",
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        } else if (res.status === 404) {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${id}/registrations`, {
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
      });

      // Refresh event data
      const eventRes = await fetch(`/api/events/${id}`);
      if (eventRes.ok) {
        setEvent(await eventRes.json());
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
            />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{error}</h1>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:underline">
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  if (!event) return null;

  const isFull = event.spotsLeft === 0;
  const canRegister = event.isActive && (!isFull || event.waitlistEnabled);
  const waitlistFull =
    isFull &&
    event.waitlistEnabled &&
    event.waitlistLimit &&
    event.waitlistCount >= event.waitlistLimit;

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
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
          Back to events
        </Link>

        {/* Event Card */}
        <div className="card p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              {isFull ? (
                <span className="badge badge-warning whitespace-nowrap">
                  {event.waitlistEnabled ? "Waitlist Only" : "Full"}
                </span>
              ) : (
                <span className="badge badge-success whitespace-nowrap">
                  {event.spotsLeft} spots left
                </span>
              )}
            </div>

            <p className="text-xl text-primary-600 font-medium mb-4">
              {event.bookTitle}
              {event.bookAuthor && (
                <span className="text-gray-500"> by {event.bookAuthor}</span>
              )}
            </p>

            {event.description && (
              <p className="text-gray-600 mb-6">{event.description}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>
                  {event.confirmedCount} / {event.totalSpots} spots filled
                  {event.waitlistCount > 0 && (
                    <span className="text-gray-500">
                      {" "}
                      ({event.waitlistCount} on waitlist)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Spots Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Availability</span>
              <span>
                {event.spotsLeft} of {event.totalSpots} available
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isFull
                    ? "bg-yellow-500"
                    : event.spotsLeft <= 3
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${(event.confirmedCount / event.totalSpots) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div
              className={`p-6 rounded-lg mb-6 animate-fade-in ${
                success.status === "confirmed"
                  ? "bg-green-50 border border-green-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {success.status === "confirmed" ? (
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0"
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
                ) : (
                  <svg
                    className="w-6 h-6 text-yellow-600 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <div>
                  <h3
                    className={`font-semibold ${
                      success.status === "confirmed"
                        ? "text-green-800"
                        : "text-yellow-800"
                    }`}
                  >
                    {success.status === "confirmed"
                      ? "You're booked!"
                      : `You're on the waitlist (#${success.position})`}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      success.status === "confirmed"
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  >
                    {success.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {!success && canRegister && !waitlistFull && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isFull ? "Join the Waitlist" : "Reserve Your Spot"}
              </h2>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="input-field"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Instagram Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    @
                  </span>
                  <input
                    type="text"
                    id="instagram"
                    required
                    className="input-field pl-8"
                    placeholder="yourhandle"
                    value={formData.instagramHandle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagramHandle: e.target.value.replace(/^@/, ""),
                      })
                    }
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  We&apos;ll send you a confirmation via Instagram DM
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : isFull ? (
                  "Join Waitlist"
                ) : (
                  "Reserve My Spot"
                )}
              </button>
            </form>
          )}

          {/* Full/Closed Messages */}
          {!canRegister && !success && (
            <div className="p-6 bg-gray-50 rounded-lg text-center">
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {!event.isActive
                  ? "Registration Closed"
                  : "This event is full"}
              </h3>
              <p className="mt-2 text-gray-500">
                {!event.isActive
                  ? "This event is no longer accepting registrations."
                  : "Unfortunately, the waitlist is also full."}
              </p>
            </div>
          )}

          {waitlistFull && !success && (
            <div className="p-6 bg-yellow-50 rounded-lg text-center">
              <svg
                className="mx-auto h-12 w-12 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-yellow-800">
                Waitlist is Full
              </h3>
              <p className="mt-2 text-yellow-700">
                Both the event and waitlist have reached capacity.
              </p>
            </div>
          )}
        </div>

        {/* Buy Me a Coffee */}
        <div className="text-center">
          <a
            href={`https://www.buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME || "yourusername"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-[#ffce00] text-gray-900 font-medium py-3 px-6 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.168.364z" />
            </svg>
            Support the book club
          </a>
        </div>
      </div>
    </main>
  );
}

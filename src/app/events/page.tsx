"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventWithStats } from "@/types";
import { formatDate } from "@/lib/utils";
import { Header, Footer } from "@/components/layout";

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events?active=true");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 pt-32 pb-16 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-16">
            <p className="section-label">Book Club Meetings</p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light mb-6">
              Upcoming Events
            </h1>
            <p className="text-white/60 max-w-xl">
              Join us for our next book club meeting. Reserve your spot today!
            </p>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="text-center py-24">
              <div className="animate-pulse-slow text-white/50 tracking-widest uppercase text-sm">
                Loading events...
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="card p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-white/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-6 text-xl font-[family-name:var(--font-cormorant)]">
                No upcoming events
              </h3>
              <p className="mt-2 text-white/50">
                Check back soon for new book club meetings!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="card block p-8 hover:bg-white/[0.04] transition-all duration-300 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h2 className="text-xl font-medium text-white">
                          {event.title}
                        </h2>
                        {event.spotsLeft === 0 ? (
                          <span className="badge badge-warning">Waitlist Only</span>
                        ) : event.spotsLeft <= 3 ? (
                          <span className="badge badge-warning">
                            {event.spotsLeft} spots left
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            {event.spotsLeft} spots available
                          </span>
                        )}
                      </div>
                      <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-white/80 mb-4">
                        {event.bookTitle}
                        {event.bookAuthor && (
                          <span className="text-white/50 not-italic">
                            {" "}
                            by {event.bookAuthor}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm text-white/50">
                        <span className="flex items-center gap-2">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-2">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-white/60 group-hover:text-white transition-colors uppercase text-sm tracking-wider">
                      RSVP
                      <svg
                        className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { EventWithStats } from "@/types";
import { formatShortDate } from "@/lib/utils";
import { Header, Footer } from "@/components/layout";
import { RSVPModal } from "@/components/RSVPModal";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

// Dynamically import BookScene to avoid SSR issues with Three.js
const BookScene = dynamic(
  () => import("@/components/three/BookScene").then((mod) => mod.BookScene),
  { ssr: false }
);

export default function HomePage() {
  const [upcomingEvent, setUpcomingEvent] = useState<EventWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchNextEvent() {
      try {
        const res = await fetch("/api/events?active=true");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setUpcomingEvent(data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNextEvent();

    // Hide loader after animation
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRSVPSuccess = async () => {
    // Refresh event data
    try {
      const res = await fetch("/api/events?active=true");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setUpcomingEvent(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to refresh event:", error);
    }
  };

  const formatEventDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const formatEventTime = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  };

  return (
    <>
      {/* Loader */}
      <div className={`loader ${!showLoader ? "hidden" : ""}`}>
        <div className="loader-text">ENTERING THE VOID</div>
      </div>

      {/* Three.js Canvas */}
      <BookScene />

      {/* Content */}
      <div className="relative z-10" style={{ pointerEvents: "none" }}>
        <Header />

        <main>
          {/* Hero Section */}
          <section className="h-screen flex flex-col justify-center items-center text-center px-8">
            <h1 className="hero-title text-6xl md:text-8xl lg:text-[10rem] font-light tracking-[0.2em] uppercase leading-none mb-8 animate-fade-up">
              {SITE_NAME}
            </h1>
            <p className="text-sm tracking-[0.4em] uppercase text-white/60 animate-fade-up-delay-1">
              A Literary Society
            </p>
            <div className="scroll-indicator animate-fade-up-delay-3">
              <span className="scroll-text">Scroll to explore</span>
              <div className="scroll-line"></div>
            </div>
          </section>

          {/* Current Book Section */}
          {!loading && upcomingEvent && (
            <section
              className="min-h-screen flex items-center px-8 md:px-16 py-24"
              id="current"
            >
              <div className="max-w-xl" style={{ pointerEvents: "auto" }}>
                <p className="section-label">
                  {formatEventDate(upcomingEvent.date)} Selection
                </p>
                <h2 className="book-title glow-text">{upcomingEvent.bookTitle}</h2>
                {upcomingEvent.bookAuthor && (
                  <p className="text-lg text-white/60 mb-6">
                    by {upcomingEvent.bookAuthor}
                  </p>
                )}
                {upcomingEvent.description && (
                  <p className="text-white/70 leading-relaxed mb-8">
                    {upcomingEvent.description}
                  </p>
                )}

                <div className="meeting-info mb-8">
                  <div className="meeting-item">
                    <span className="meeting-label">Date</span>
                    <span className="meeting-value">
                      {formatEventDate(upcomingEvent.date)}
                    </span>
                  </div>
                  <div className="meeting-item">
                    <span className="meeting-label">Time</span>
                    <span className="meeting-value">
                      {formatEventTime(upcomingEvent.date)}
                    </span>
                  </div>
                  <div className="meeting-item">
                    <span className="meeting-label">Spots Left</span>
                    <span className="meeting-value">
                      {upcomingEvent.spotsLeft} / {upcomingEvent.totalSpots}
                    </span>
                  </div>
                </div>

                <button onClick={() => setModalOpen(true)} className="cta-button">
                  Reserve Your Seat
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </section>
          )}

          {/* Loading state */}
          {loading && (
            <section className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-pulse-slow text-white/50 tracking-widest uppercase text-sm">
                  Loading...
                </div>
              </div>
            </section>
          )}

          {/* No events state */}
          {!loading && !upcomingEvent && (
            <section className="min-h-screen flex items-center justify-center px-8">
              <div className="text-center" style={{ pointerEvents: "auto" }}>
                <p className="section-label mb-4">No upcoming events</p>
                <p className="text-white/60 mb-8">
                  Check back soon for our next book club meeting.
                </p>
                <Link href="/events" className="cta-button">
                  View All Events
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </section>
          )}

          {/* Past Books Preview Section */}
          <section className="min-h-screen px-8 md:px-16 py-24" id="archive">
            <p className="section-label">Previous Explorations</p>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              style={{ pointerEvents: "auto" }}
            >
              {/* These would ideally come from your database */}
              <div className="past-book-card">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-4">
                  Coming Soon
                </p>
                <h3 className="font-[family-name:var(--font-cormorant)] text-xl italic mb-2">
                  Book Archive
                </h3>
                <p className="text-sm text-white/50">
                  Our reading history will appear here
                </p>
              </div>
            </div>
          </section>

          {/* Connect Section */}
          <section className="py-24 px-8 md:px-16">
            <div className="max-w-2xl mx-auto text-center">
              <p className="section-label">Stay Connected</p>
              <p className="text-white/60 mb-12">
                Follow us on social media to stay updated on upcoming events and
                book picks.
              </p>
              <div
                className="flex flex-col sm:flex-row justify-center gap-4"
                style={{ pointerEvents: "auto" }}
              >
                {SOCIAL_LINKS.instagram && (
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </a>
                )}
                {SOCIAL_LINKS.whatsapp && (
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* RSVP Modal */}
      {upcomingEvent && (
        <RSVPModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          event={upcomingEvent}
          onSuccess={handleRSVPSuccess}
        />
      )}
    </>
  );
}

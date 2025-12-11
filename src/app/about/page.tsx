import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn more about ${SITE_NAME} - a community of book lovers sharing stories, ideas, and great reads.`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-32 pb-16 px-8 md:px-16">
          <div className="max-w-3xl mx-auto">
            <p className="section-label">About Us</p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light mb-6">
              {SITE_NAME}
            </h1>
            <p className="text-xl text-white/60">
              Where book lovers come together to share, discuss, and discover.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 px-8 md:px-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-8">
              Our Story
            </h2>
            <div className="space-y-6 text-white/70 leading-relaxed">
              <p>
                {SITE_NAME} started with a simple idea: bring together people who love
                to read and create a space for meaningful conversations about books.
              </p>
              <p>
                What began as a small group of friends meeting at a local cafe has
                grown into a vibrant community of readers from all walks of life.
                We believe that books have the power to connect people, spark new
                ideas, and broaden our perspectives.
              </p>
              <p>
                Whether you&apos;re a casual reader or a literary enthusiast,
                you&apos;ll find a welcoming home here. Join us for our monthly
                meetups where we dive deep into our chosen reads and share our
                thoughts in an open, friendly environment.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-8 md:px-16 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-12 text-center">
              How It Works
            </h2>
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 border border-white/20 text-white flex items-center justify-center font-[family-name:var(--font-cormorant)] text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Check Upcoming Events
                  </h3>
                  <p className="text-white/60">
                    Browse our events page to see what book we&apos;re reading next
                    and when we&apos;re meeting.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 border border-white/20 text-white flex items-center justify-center font-[family-name:var(--font-cormorant)] text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    RSVP for a Meetup
                  </h3>
                  <p className="text-white/60">
                    Reserve your spot with your email. We&apos;ll send you a
                    confirmation and reminder before the event.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 border border-white/20 text-white flex items-center justify-center font-[family-name:var(--font-cormorant)] text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Read the Book
                  </h3>
                  <p className="text-white/60">
                    Get your copy of the book and read at your own pace.
                    Don&apos;t worry if you don&apos;t finish - all are welcome!
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 border border-white/20 text-white flex items-center justify-center font-[family-name:var(--font-cormorant)] text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Join the Discussion
                  </h3>
                  <p className="text-white/60">
                    Come to the meetup, share your thoughts, and connect with
                    fellow readers. It&apos;s that simple!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className="py-24 px-8 md:px-16 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-4">
              Ready to Join?
            </h2>
            <p className="text-white/60 mb-12">
              Check out our upcoming events and reserve your spot today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events" className="cta-button">
                View Events
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              {SOCIAL_LINKS.instagram && (
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button"
                >
                  Follow on Instagram
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

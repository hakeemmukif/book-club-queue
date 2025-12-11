import Link from "next/link";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 px-8 md:px-16 py-16 border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-sm text-white/40 tracking-wide">
          &copy; {currentYear} {SITE_NAME}
        </p>

        <div className="flex items-center gap-8">
          {SOCIAL_LINKS.instagram && (
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Instagram
            </a>
          )}
          {SOCIAL_LINKS.whatsapp && (
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              WhatsApp
            </a>
          )}
          <Link href="/events" className="footer-link">
            Events
          </Link>
          <Link href="/about" className="footer-link">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}

/**
 * Application constants
 */

// Site branding
export const SITE_NAME = "Eat Books Club";
export const SITE_DESCRIPTION = "Join our book club community. Reserve your spot for upcoming meetings and discussions.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eatbooksclub.com";

// Registration status
export const REGISTRATION_STATUS = {
  CONFIRMED: "confirmed",
  WAITLIST: "waitlist",
} as const;

export type RegistrationStatus = typeof REGISTRATION_STATUS[keyof typeof REGISTRATION_STATUS];

// Event limits
export const EVENT_LIMITS = {
  MAX_SPOTS: 1000,
  MAX_WAITLIST: 1000,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  DEFAULT_DURATION_HOURS: 2,
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  INSTAGRAM_MIN: 1,
  INSTAGRAM_MAX: 30,
  EMAIL_MAX: 254,
} as const;

// Social links
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || "",
  buyMeACoffee: process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME
    ? `https://www.buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME}`
    : "",
} as const;

// Navigation items
export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
] as const;

// Footer navigation
export const FOOTER_LINKS = {
  main: [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
  ],
  social: [
    { label: "Instagram", href: SOCIAL_LINKS.instagram, icon: "instagram" },
    { label: "WhatsApp", href: SOCIAL_LINKS.whatsapp, icon: "whatsapp" },
  ],
} as const;

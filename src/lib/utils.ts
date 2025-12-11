/**
 * Shared utility functions
 */

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatShortDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateOnly(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Generate a random token for cancellation links
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  description?: string;
  location: string;
  date: string | Date;
  durationHours?: number;
}): string {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + (event.durationHours || 2) * 60 * 60 * 1000);

  const formatForGoogle = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`,
    details: event.description || '',
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Apple Calendar (.ics) content
 */
export function generateICSContent(event: {
  title: string;
  description?: string;
  location: string;
  date: string | Date;
  durationHours?: number;
}): string {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + (event.durationHours || 2) * 60 * 60 * 1000);

  const formatForICS = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1);
  };

  const uid = `${Date.now()}@eatbooksclub.com`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Eat Books Club//Event//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatForICS(new Date())}Z
DTSTART:${formatForICS(startDate)}Z
DTEND:${formatForICS(endDate)}Z
SUMMARY:${event.title}
DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateString: string | Date): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Check if event is within 24 hours
 */
export function isWithin24Hours(dateString: string | Date): boolean {
  const eventDate = new Date(dateString);
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

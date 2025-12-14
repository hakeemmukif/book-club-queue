/**
 * Simple in-memory rate limiter for API routes
 * For production at scale, consider using Redis or a dedicated rate limiting service
 */

import { randomUUID } from 'crypto';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Store interval reference to allow cleanup and prevent memory leaks
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the cleanup interval for expired rate limit entries
 * Call this once during application startup
 */
export function startRateLimitCleanup(): void {
  if (cleanupInterval) return; // Prevent multiple intervals

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    entries.forEach(([key, record]) => {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}

/**
 * Stop the cleanup interval (useful for testing or graceful shutdown)
 */
export function stopRateLimitCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// Auto-start cleanup in non-test environments
if (typeof setInterval !== 'undefined' && process.env.NODE_ENV !== 'test') {
  startRateLimitCleanup();
}

interface RateLimitOptions {
  maxRequests: number;  // Maximum requests allowed in the window
  windowMs: number;     // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param options - Rate limiting configuration
 * @returns Object with success status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { maxRequests, windowMs } = options;
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // If no record exists or window has expired, create new record
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // Check if rate limit exceeded
  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count
  record.count++;
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get client identifier from request headers
 *
 * Security considerations:
 * - X-Forwarded-For can be spoofed if not behind a trusted proxy
 * - In production, Vercel/Cloudflare add verified headers
 * - For Vercel: use x-vercel-forwarded-for or x-real-ip (verified by Vercel)
 * - Falls back to a random UUID to prevent shared bucket attacks
 *
 * @param headers - Request headers
 * @returns Client identifier string
 */
export function getClientIdentifier(headers: Headers): string {
  // Vercel-verified IP (cannot be spoofed when deployed on Vercel)
  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp.split(",")[0].trim();
  }

  // Cloudflare-verified IP
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  // Real IP set by trusted reverse proxy
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // X-Forwarded-For - only use first IP (closest to client)
  // Note: This can be spoofed if not behind trusted proxy
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Fallback: generate unique ID per request to prevent shared bucket
  // This is less effective but prevents attackers from using shared "unknown" bucket
  return `anon-${randomUUID()}`;
}

// Preset rate limit configurations
export const RATE_LIMITS = {
  // For admin login attempts - stricter
  adminAuth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // For event registrations
  registration: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // For general API requests
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // For cancellation requests
  cancellation: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

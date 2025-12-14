import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { RateLimitError, handleError } from "@/lib/errors";

/**
 * Constant-time string comparison to prevent timing attacks
 * Returns true if strings match, false otherwise
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;

  // Pad to same length to prevent length-based timing leaks
  const maxLength = Math.max(a.length, b.length);
  const paddedA = a.padEnd(maxLength, '\0');
  const paddedB = b.padEnd(maxLength, '\0');

  const bufA = Buffer.from(paddedA, 'utf8');
  const bufB = Buffer.from(paddedB, 'utf8');

  // timingSafeEqual requires same length buffers
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// POST /api/admin/verify - Verify admin password
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for admin login attempts (5 attempts per 15 minutes)
    const clientId = getClientIdentifier(request.headers);
    const rateLimitKey = `admin-verify:${clientId}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.adminAuth);

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      throw new RateLimitError(
        retryAfter,
        "Too many login attempts. Please try again later."
      );
    }

    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    // Use constant-time comparison to prevent timing attacks
    const isValid = constantTimeCompare(password || "", adminPassword);

    // Add consistent delay regardless of success/failure to prevent timing analysis
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 100));

    if (isValid) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    const { message, statusCode, code } = handleError(error);

    // Add rate limit headers if applicable
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: message, code },
        {
          status: statusCode,
          headers: {
            "Retry-After": String(error.retryAfter),
          },
        }
      );
    }

    return NextResponse.json({ error: message, code }, { status: statusCode });
  }
}

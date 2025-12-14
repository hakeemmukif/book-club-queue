import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registrationSchema } from "@/lib/validations";
import { generateToken } from "@/lib/utils";
import { REGISTRATION_STATUS } from "@/lib/constants";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { RateLimitError, handleError, NotFoundError, ConflictError, ValidationError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id]/registrations - List registrations (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const adminPassword = request.headers.get("x-admin-password");

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if full receipt data is requested (for viewing individual receipts)
    const includeReceipts = request.nextUrl.searchParams.get('includeReceipts') === 'true';

    const registrations = await prisma.registration.findMany({
      where: { eventId: id },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        eventId: true,
        name: true,
        email: true,
        instagramHandle: true,
        status: true,
        createdAt: true,
        // Only include full receipt data when explicitly requested
        // This improves performance for list views
        receiptUrl: includeReceipts,
      },
    });

    // If not including full receipts, add a flag indicating if receipt exists
    const registrationsWithFlag = includeReceipts
      ? registrations
      : registrations.map(reg => ({
          ...reg,
          hasReceipt: !!reg.receiptUrl,
          receiptUrl: undefined,
        }));

    return NextResponse.json(registrationsWithFlag);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/registrations - Register for event
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting for registrations (10 per hour per IP)
    const clientId = getClientIdentifier(request.headers);
    const rateLimitKey = `registration:${clientId}`;
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.registration);

    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      throw new RateLimitError(
        retryAfter,
        "Too many registration attempts. Please try again later."
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Validation failed",
        validationResult.error.flatten()
      );
    }

    const { name, instagramHandle, email, receiptUrl } = validationResult.data;

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Get event with registration counts (inside transaction)
      const event = await tx.event.findUnique({
        where: { id },
        include: {
          registrations: {
            select: { status: true, email: true, instagramHandle: true },
          },
        },
      });

      if (!event) {
        return { error: "Event not found", status: 404 };
      }

      if (!event.isActive) {
        return { error: "This event is no longer accepting registrations", status: 400 };
      }

      // Check for duplicate registration by email
      const existingRegistration = event.registrations.find(
        (r) => r.email?.toLowerCase() === email.toLowerCase()
      );

      if (existingRegistration) {
        return { error: "You have already registered for this event with this email", status: 400 };
      }

      // Calculate spots
      const confirmedCount = event.registrations.filter(
        (r) => r.status === "confirmed"
      ).length;
      const spotsLeft = event.totalSpots - confirmedCount;

      // Check if event is full (no waitlist)
      if (spotsLeft <= 0) {
        return { error: "Sorry, this event is sold out!", status: 400 };
      }

      // Generate cancellation token
      const cancelToken = generateToken();

      // Create registration (inside same transaction)
      const registration = await tx.registration.create({
        data: {
          eventId: id,
          name,
          instagramHandle: instagramHandle || "",
          email,
          receiptUrl: receiptUrl || null,
          status: REGISTRATION_STATUS.CONFIRMED,
          cancelToken,
        },
      });

      return { registration, event };
    });

    // Handle transaction errors
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { registration, event } = result;

    // Webhook notification (if configured)
    if (process.env.INSTAGRAM_WEBHOOK_URL) {
      try {
        await fetch(process.env.INSTAGRAM_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new_registration",
            eventId: event.id,
            eventTitle: event.title,
            registration: {
              name,
              instagramHandle,
              status: registration.status,
            },
          }),
        });
      } catch (webhookError) {
        console.error("Webhook notification failed:", webhookError);
        // Don't fail the registration if webhook fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        registration: {
          id: registration.id,
          status: registration.status,
          cancelToken: registration.cancelToken,
        },
        message: "You're booked! We'll send you a confirmation and reminder before the event.",
      },
      { status: 201 }
    );
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

// DELETE /api/events/[id]/registrations - Remove a registration (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const adminPassword = request.headers.get("x-admin-password");

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID required" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findFirst({
      where: { id: registrationId, eventId: id },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    await prisma.registration.delete({
      where: { id: registrationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}

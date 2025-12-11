import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registrationSchema } from "@/lib/validations";
import { generateToken } from "@/lib/utils";
import { REGISTRATION_STATUS } from "@/lib/constants";

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

    const registrations = await prisma.registration.findMany({
      where: { eventId: id },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(registrations);
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
    const { id } = await params;
    const body = await request.json();

    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, instagramHandle, email } = validationResult.data;

    // Get event with registration counts
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          select: { status: true, email: true, instagramHandle: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isActive) {
      return NextResponse.json(
        { error: "This event is no longer accepting registrations" },
        { status: 400 }
      );
    }

    // Check for duplicate registration by email
    const existingRegistration = event.registrations.find(
      (r) => r.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You have already registered for this event with this email" },
        { status: 400 }
      );
    }

    // Calculate spots
    const confirmedCount = event.registrations.filter(
      (r) => r.status === "confirmed"
    ).length;
    const waitlistCount = event.registrations.filter(
      (r) => r.status === "waitlist"
    ).length;
    const spotsLeft = event.totalSpots - confirmedCount;

    // Determine registration status
    let status: "confirmed" | "waitlist";
    let position: number | null = null;

    if (spotsLeft > 0) {
      status = REGISTRATION_STATUS.CONFIRMED;
    } else if (event.waitlistEnabled) {
      // Check waitlist limit
      if (event.waitlistLimit && waitlistCount >= event.waitlistLimit) {
        return NextResponse.json(
          { error: "The waitlist is full" },
          { status: 400 }
        );
      }
      status = REGISTRATION_STATUS.WAITLIST;
      position = waitlistCount + 1;
    } else {
      return NextResponse.json(
        { error: "This event is full and waitlist is not enabled" },
        { status: 400 }
      );
    }

    // Generate cancellation token
    const cancelToken = generateToken();

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        eventId: id,
        name,
        instagramHandle: instagramHandle || "",
        email,
        status,
        position,
        cancelToken,
      },
    });

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
              status,
              position,
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
          position: registration.position,
          cancelToken: registration.cancelToken,
        },
        message:
          status === REGISTRATION_STATUS.CONFIRMED
            ? "You're booked! We'll send you a confirmation and reminder before the event."
            : `You're on the waitlist at position ${position}. We'll notify you if a spot opens up.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
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

    // If removing a confirmed registration, promote first waitlisted person
    if (registration.status === "confirmed") {
      const firstWaitlisted = await prisma.registration.findFirst({
        where: { eventId: id, status: "waitlist" },
        orderBy: { position: "asc" },
      });

      if (firstWaitlisted) {
        await prisma.registration.update({
          where: { id: firstWaitlisted.id },
          data: { status: "confirmed", position: null },
        });

        // Update positions for remaining waitlist
        await prisma.registration.updateMany({
          where: {
            eventId: id,
            status: "waitlist",
            position: { gt: firstWaitlisted.position || 0 },
          },
          data: { position: { decrement: 1 } },
        });
      }
    } else {
      // Update positions for remaining waitlist
      await prisma.registration.updateMany({
        where: {
          eventId: id,
          status: "waitlist",
          position: { gt: registration.position || 0 },
        },
        data: { position: { decrement: 1 } },
      });
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

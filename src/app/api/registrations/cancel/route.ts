import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { REGISTRATION_STATUS } from "@/lib/constants";

// POST /api/registrations/cancel - Cancel a registration via token
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Cancellation token is required" },
        { status: 400 }
      );
    }

    // Find registration by cancel token
    const registration = await prisma.registration.findUnique({
      where: { cancelToken: token },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Invalid or expired cancellation link" },
        { status: 404 }
      );
    }

    // Check if event is in the past
    if (new Date(registration.event.date) < new Date()) {
      return NextResponse.json(
        { error: "Cannot cancel registration for past events" },
        { status: 400 }
      );
    }

    const eventId = registration.eventId;
    const wasConfirmed = registration.status === REGISTRATION_STATUS.CONFIRMED;

    // If removing a confirmed registration, promote first waitlisted person
    if (wasConfirmed) {
      const firstWaitlisted = await prisma.registration.findFirst({
        where: { eventId, status: REGISTRATION_STATUS.WAITLIST },
        orderBy: { position: "asc" },
      });

      if (firstWaitlisted) {
        await prisma.registration.update({
          where: { id: firstWaitlisted.id },
          data: {
            status: REGISTRATION_STATUS.CONFIRMED,
            position: null,
            notifiedAt: new Date(), // Mark as notified (to be sent via email)
          },
        });

        // Update positions for remaining waitlist
        await prisma.registration.updateMany({
          where: {
            eventId,
            status: REGISTRATION_STATUS.WAITLIST,
            position: { gt: firstWaitlisted.position || 0 },
          },
          data: { position: { decrement: 1 } },
        });

        // TODO: Send email notification to promoted person
      }
    } else {
      // Update positions for remaining waitlist
      await prisma.registration.updateMany({
        where: {
          eventId,
          status: REGISTRATION_STATUS.WAITLIST,
          position: { gt: registration.position || 0 },
        },
        data: { position: { decrement: 1 } },
      });
    }

    // Delete the registration
    await prisma.registration.delete({
      where: { id: registration.id },
    });

    return NextResponse.json({
      success: true,
      message: "Your registration has been cancelled successfully.",
      eventTitle: registration.event.title,
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}

// GET /api/registrations/cancel?token=xxx - Get registration details for cancel page
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Cancellation token is required" },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.findUnique({
      where: { cancelToken: token },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            bookTitle: true,
            bookAuthor: true,
            date: true,
            location: true,
          }
        }
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Invalid or expired cancellation link" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registration: {
        id: registration.id,
        name: registration.name,
        status: registration.status,
        position: registration.position,
      },
      event: registration.event,
      canCancel: new Date(registration.event.date) > new Date(),
    });
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration details" },
      { status: 500 }
    );
  }
}

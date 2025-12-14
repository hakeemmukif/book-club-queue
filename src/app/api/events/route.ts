import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { eventSchema } from "@/lib/validations";

// GET /api/events - List all events (with optional active filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";

    // Use Prisma aggregation to count confirmed registrations in the database
    // instead of fetching all registrations and filtering in JS (N+1 fix)
    const events = await prisma.event.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: "confirmed" }
            }
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const eventsWithStats = events.map((event) => {
      const confirmedCount = event._count.registrations;

      return {
        id: event.id,
        title: event.title,
        bookTitle: event.bookTitle,
        bookAuthor: event.bookAuthor,
        location: event.location,
        date: event.date,
        totalSpots: event.totalSpots,
        description: event.description,
        isActive: event.isActive,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        confirmedCount,
        spotsLeft: Math.max(0, event.totalSpots - confirmedCount),
      };
    });

    return NextResponse.json(eventsWithStats);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminPassword = request.headers.get("x-admin-password");
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = eventSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        bookTitle: data.bookTitle,
        bookAuthor: data.bookAuthor || null,
        location: data.location,
        date: new Date(data.date),
        totalSpots: data.totalSpots,
        description: data.description || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

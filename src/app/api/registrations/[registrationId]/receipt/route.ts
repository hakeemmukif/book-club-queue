import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ registrationId: string }>;
}

// GET /api/registrations/[registrationId]/receipt - Get single receipt (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { registrationId } = await params;
    const adminPassword = request.headers.get("x-admin-password");

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        receiptUrl: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (!registration.receiptUrl) {
      return NextResponse.json({ error: "No receipt uploaded" }, { status: 404 });
    }

    return NextResponse.json({ receiptUrl: registration.receiptUrl });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { contacts } = body; // Array of { name, phone }

    if (!contacts || !Array.isArray(contacts)) {
      return new NextResponse("Invalid data format", { status: 400 });
    }

    // Format the incoming contacts
    const formattedContacts = contacts
      .filter((c: any) => c.name && c.phone)
      .map((c: any) => ({
        userId: session.user.id,
        name: String(c.name).trim(),
        // Extract only digits and ensure standard format
        phone: String(c.phone).replace(/[^0-9+]/g, ""),
        tags: c.tags || "CSV Import",
      }));

    if (formattedContacts.length === 0) {
      return new NextResponse("No valid contacts found", { status: 400 });
    }

    // Bulk insert (using createMany)
    await db.contact.createMany({
      data: formattedContacts,
    });

    return NextResponse.json({ success: true, count: formattedContacts.length });
  } catch (error) {
    console.error("[CONTACTS_BULK_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const contacts = await db.contact.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("[CONTACTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, phone, tags, notes } = body;

    if (!name || !phone) {
      return new NextResponse("Name and phone are required", { status: 400 });
    }

    const contact = await db.contact.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        tags,
        notes,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

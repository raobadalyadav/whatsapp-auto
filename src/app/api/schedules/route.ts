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
    const { templateId, contactIds, sendAt } = body;

    if (!templateId || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0 || !sendAt) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create the schedule
    const schedule = await db.schedule.create({
      data: {
        userId: session.user.id,
        templateId,
        sendAt: new Date(sendAt),
        status: "PENDING",
      },
    });

    // Create message logs for each recipient
    const logsData = contactIds.map((contactId: string) => ({
      scheduleId: schedule.id,
      contactId,
      status: "PENDING",
    }));

    await db.messageLog.createMany({
      data: logsData,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("[SCHEDULES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const schedule = await db.schedule.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!schedule) {
      return new NextResponse("Schedule not found", { status: 404 });
    }

    if (schedule.status !== "PENDING") {
      return new NextResponse("Only pending schedules can be deleted", { status: 400 });
    }

    // Delete associated logs first
    await db.messageLog.deleteMany({
      where: { scheduleId: id },
    });

    await db.schedule.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SCHEDULE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

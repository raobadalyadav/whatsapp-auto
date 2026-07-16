import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SchedulesClient } from "./components/client";

export default async function SchedulesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const schedules = await db.schedule.findMany({
    where: { userId: session.user.id },
    include: { template: true },
    orderBy: { sendAt: "desc" },
  });

  return <SchedulesClient data={schedules} />;
}

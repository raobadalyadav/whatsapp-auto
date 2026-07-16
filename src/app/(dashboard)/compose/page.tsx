import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ComposeClient } from "./components/client";

export default async function ComposePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const contacts = await db.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const templates = await db.template.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ComposeClient contacts={contacts} templates={templates} />
      </div>
    </div>
  );
}

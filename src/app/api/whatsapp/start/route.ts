import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWhatsAppClient } from "@/lib/whatsapp-client";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Trigger the initialization if it hasn't started yet
  getWhatsAppClient();

  return NextResponse.json({ success: true, message: "Client initialized" });
}

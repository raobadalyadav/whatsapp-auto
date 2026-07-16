import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Helper for waiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomDelay = () => Math.floor(Math.random() * (15000 - 8000 + 1) + 8000); // 8-15 seconds

export async function GET(request: Request) {
  try {
    // 1. Find all schedules that are PENDING and sendAt is in the past
    const now = new Date();
    const pendingSchedules = await db.schedule.findMany({
      where: {
        status: "PENDING",
        sendAt: { lte: now },
      },
      include: {
        template: true,
        logs: {
          include: { contact: true }
        }
      },
    });

    if (pendingSchedules.length === 0) {
      return NextResponse.json({ success: true, message: "No pending schedules" });
    }

    // Since we are using WhatsApp Web, we want to run sequentially in the background 
    // and not block the API response entirely. But for Next.js API routes, it's safer 
    // to just run them and return if deployed on VPS, or return immediately and process async.
    // For local MVP, we process them async.
    
    processSchedulesSequentially(pendingSchedules);

    return NextResponse.json({ success: true, message: "Processing started", count: pendingSchedules.length });
  } catch (error) {
    console.error("[CRON_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

async function processSchedulesSequentially(schedules: any[]) {
  console.log(`[CRON] Starting sequential processing of ${schedules.length} schedules...`);
  
  for (const schedule of schedules) {
    // Mark as PROCESSING
    await db.schedule.update({
      where: { id: schedule.id },
      data: { status: "PROCESSING" },
    });

    let allSuccess = true;

    for (let i = 0; i < schedule.logs.length; i++) {
      const log = schedule.logs[i];
      if (log.status !== "PENDING") continue;

      try {
        // Replace variables in template
        let message = schedule.template.content;
        message = message.replace(/\{\{name\}\}/g, log.contact.name);
        message = message.replace(/\{\{firstname\}\}/g, log.contact.name.split(" ")[0]);
        message = message.replace(/\{\{phone\}\}/g, log.contact.phone);

        // Send message via Puppeteer
        console.log(`[CRON] Sending message ${i+1}/${schedule.logs.length} to ${log.contact.name}...`);
        const result = await sendWhatsAppMessage(log.contact.phone, message);

        // Update log
        await db.messageLog.update({
          where: { id: log.id },
          data: { 
            status: "SENT",
            wabaMsgId: result.wabaMsgId 
          },
        });
        console.log(`[CRON] Message sent successfully to ${log.contact.name}.`);
      } catch (error: any) {
        allSuccess = false;
        console.error(`[CRON] Failed to send to ${log.contact.name}:`, error.message);
        await db.messageLog.update({
          where: { id: log.id },
          data: { 
            status: "FAILED",
            error: error.message 
          },
        });
      }

      // Wait 8-15 seconds between messages if there are more contacts in this batch
      if (i < schedule.logs.length - 1) {
        const waitTime = getRandomDelay();
        console.log(`[CRON] Waiting ${Math.round(waitTime/1000)} seconds before next message to avoid bans...`);
        await delay(waitTime);
      }
    }

    // Update schedule status
    await db.schedule.update({
      where: { id: schedule.id },
      data: { status: allSuccess ? "COMPLETED" : "FAILED" },
    });
    console.log(`[CRON] Schedule ${schedule.id} marked as ${allSuccess ? "COMPLETED" : "FAILED"}.`);
  }
}

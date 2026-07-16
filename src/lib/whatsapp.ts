import { getWhatsAppClient } from "./whatsapp-client";

export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const client = getWhatsAppClient();
    
    // Check if client is initialized and ready
    const status = globalThis.whatsappStatus;
    if (status !== 'CONNECTED') {
      throw new Error(`WhatsApp client is not connected. Current status: ${status}`);
    }

    // Format phone number to international format without + or spaces
    let formattedNumber = to.replace(/[^0-9]/g, "");
    
    // Auto-append country code if it looks like an Indian number without one
    if (formattedNumber.length === 10) {
      formattedNumber = "91" + formattedNumber;
    }

    const chatId = `${formattedNumber}@c.us`;

    // Send the message using whatsapp-web.js
    const response = await client.sendMessage(chatId, message);

    return {
      success: true,
      wabaMsgId: response?.id?.id || response?.id?._serialized || `local-${Date.now()}`,
    };
  } catch (error: any) {
    console.error("[WA_SEND_ERROR]", error);
    throw new Error(error.message || "Failed to send WhatsApp message via Puppeteer");
  }
}

import { Client, LocalAuth } from 'whatsapp-web.js';

declare global {
  var whatsappClient: Client | undefined;
  var whatsappQR: string | null;
  var whatsappStatus: 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED';
}

if (!globalThis.whatsappStatus) {
  globalThis.whatsappStatus = 'DISCONNECTED';
}
if (!globalThis.whatsappQR) {
  globalThis.whatsappQR = null;
}

export function getWhatsAppClient(): Client {
  if (globalThis.whatsappClient) {
    return globalThis.whatsappClient;
  }

  console.log('[WA] Initializing new WhatsApp Client...');
  globalThis.whatsappStatus = 'INITIALIZING';

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  client.on('qr', (qr) => {
    console.log('[WA] QR Code received');
    globalThis.whatsappQR = qr;
    globalThis.whatsappStatus = 'QR_READY';
  });

  client.on('ready', () => {
    console.log('[WA] Client is ready!');
    globalThis.whatsappQR = null;
    globalThis.whatsappStatus = 'CONNECTED';
  });

  client.on('authenticated', () => {
    console.log('[WA] Authenticated successfully');
  });

  client.on('auth_failure', (msg) => {
    console.error('[WA] Authentication failure:', msg);
    globalThis.whatsappStatus = 'DISCONNECTED';
  });

  client.on('disconnected', (reason) => {
    console.log('[WA] Client was disconnected:', reason);
    globalThis.whatsappStatus = 'DISCONNECTED';
    globalThis.whatsappClient = undefined;
  });

  client.initialize().catch(err => {
    console.error('[WA] Failed to initialize client', err);
    globalThis.whatsappStatus = 'DISCONNECTED';
  });

  globalThis.whatsappClient = client;
  return client;
}

export function getStatus() {
  return {
    status: globalThis.whatsappStatus,
    qr: globalThis.whatsappQR,
  };
}

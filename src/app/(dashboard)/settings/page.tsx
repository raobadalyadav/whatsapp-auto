"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [status, setStatus] = useState<string>("DISCONNECTED");
  const [qr, setQr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      setStatus(data.status);
      setQr(data.qr);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/whatsapp/start", { method: "POST" });
      toast.success("WhatsApp client initializing...");
      fetchStatus();
    } catch (e) {
      toast.error("Failed to start WhatsApp client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Settings & Integration</h2>
        
        <div className="grid gap-4 md:grid-cols-2 pt-4">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                WhatsApp Web Connection
              </CardTitle>
              <CardDescription>
                Link your WhatsApp account by scanning the QR code to send automated messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
              
              {status === "DISCONNECTED" && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">Client is not running.</p>
                  <Button onClick={handleStart} disabled={isLoading} className="bg-primary text-primary-foreground">
                    {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Start WhatsApp Client
                  </Button>
                </div>
              )}

              {status === "INITIALIZING" && (
                <div className="text-center space-y-4 flex flex-col items-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Initializing browser session...</p>
                </div>
              )}

              {status === "QR_READY" && qr && (
                <div className="text-center space-y-4 flex flex-col items-center">
                  <div className="p-4 bg-white rounded-xl shadow-lg">
                    <QRCodeSVG value={qr} size={200} />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Scan this QR code with your WhatsApp app.
                  </p>
                </div>
              )}

              {status === "CONNECTED" && (
                <div className="text-center space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium">WhatsApp Connected!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your account is securely linked and ready to send messages.
                  </p>
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md h-fit">
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure message sending behaviors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Sending Delay:</strong> 8 to 15 seconds (Randomized)
                </p>
                <p className="text-xs text-muted-foreground">
                  A built-in delay between messages mimics human behavior and heavily reduces the risk of bans. This cannot be disabled for your safety.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

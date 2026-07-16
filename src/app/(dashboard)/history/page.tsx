import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // We find logs through the schedule relation
  const logs = await db.messageLog.findMany({
    where: { 
      schedule: { userId: session.user.id } 
    },
    include: { 
      contact: true,
      schedule: { include: { template: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Message History</h2>
        
        <Card className="mt-4 border-border bg-card shadow-md">
          <CardHeader>
            <CardTitle>Recently Sent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No message history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.contact.name}
                        <div className="text-xs text-muted-foreground">{log.contact.phone}</div>
                      </TableCell>
                      <TableCell>{log.schedule.template.name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          log.status === "SENT" ? "default" :
                          log.status === "PENDING" ? "secondary" : "destructive"
                        }>
                          {log.status}
                        </Badge>
                        {log.error && (
                          <div className="text-xs text-red-500 mt-1">{log.error}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

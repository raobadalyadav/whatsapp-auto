"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Schedule, Template } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ScheduleWithTemplate = Schedule & { template: Template };

interface SchedulesClientProps {
  data: ScheduleWithTemplate[];
}

export function SchedulesClient({ data: initialData }: SchedulesClientProps) {
  const router = useRouter();
  const [data, setData] = useState<ScheduleWithTemplate[]>(initialData);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled message?")) return;

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Failed to cancel schedule");
      }

      toast.success("Schedule cancelled successfully");
      setData((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Message Schedules</h2>
        
        <Card className="mt-4 border-border bg-card shadow-md">
          <CardHeader>
            <CardTitle>Upcoming & Past Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No schedules found. Go to Compose to schedule a message.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.template.name}</TableCell>
                      <TableCell>
                        {new Date(schedule.sendAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          schedule.status === "COMPLETED" ? "default" :
                          schedule.status === "PENDING" ? "secondary" : "destructive"
                        }>
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {schedule.status === "PENDING" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleCancel(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                        )}
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

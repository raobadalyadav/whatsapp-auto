import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [contactCount, templateCount, scheduleCount] = await Promise.all([
    db.contact.count({ where: { userId: session.user.id } }),
    db.template.count({ where: { userId: session.user.id } }),
    db.schedule.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard Overview</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
          <Link href="/contacts" className="hover:scale-[1.02] transition-transform">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contactCount}</div>
                <p className="text-xs text-muted-foreground">Manage your address book</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/templates" className="hover:scale-[1.02] transition-transform">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Templates</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templateCount}</div>
                <p className="text-xs text-muted-foreground">Pre-written messages</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/schedules" className="hover:scale-[1.02] transition-transform">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduleCount}</div>
                <p className="text-xs text-muted-foreground">Upcoming messages</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 p-6 bg-secondary/50 rounded-xl border border-border">
          <h3 className="text-xl font-bold mb-2">Welcome back, {session.user.name}!</h3>
          <p className="text-muted-foreground">
            Get started by composing a new message or managing your existing templates and contacts.
          </p>
          <div className="mt-4">
            <Link 
              href="/compose" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
            >
              Compose New Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

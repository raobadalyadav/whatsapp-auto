import Link from "next/link";
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  LayoutDashboard, 
  History, 
  Settings 
} from "lucide-react";

export function Sidebar() {
  const routes = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Contacts", path: "/contacts", icon: Users },
    { name: "Templates", path: "/templates", icon: MessageSquare },
    { name: "Schedules", path: "/schedules", icon: Calendar },
    { name: "History", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col bg-card border-r border-border h-full">
      <div className="p-6 flex items-center gap-2 border-b border-border">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">
          AutoWA
        </h1>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
          >
            <route.icon className="w-5 h-5" />
            <span className="font-medium">{route.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

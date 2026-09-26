"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, LayoutDashboard, FileText, Search, Calendar, MessageCircle, Settings, ShieldAlert, Bell, User } from "lucide-react";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/complaints", label: "Complaints", icon: FileText },
    { href: "/lost-found", label: "Lost & Found", icon: Search },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/community", label: "Community", icon: MessageCircle },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const adminItems = [
    { href: "/admin", label: "Admin Panel", icon: ShieldAlert },
  ];

  const allItems: any[] = ["admin", "moderator"].includes(role) 
    ? [...navItems, { href: "", label: "ADMIN", icon: null, isHeader: true }, ...adminItems] 
    : navItems;

  return (
    <aside className="hidden border-r bg-card md:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div className="flex h-14 items-center border-b px-4 lg:px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg tracking-tight">CampusFlow</span>
        </Link>
      </div>
      <div className="flex-1 py-4">
        <nav className="grid items-start px-2 text-sm font-medium">
          {allItems.map((item, i) => {
            if (item.isHeader) {
              return (
                <div key={i} className="px-4 py-2 mt-4 text-xs font-semibold text-muted-foreground tracking-wider">
                  {item.label}
                </div>
              );
            }
            
            const Icon = item.icon!;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

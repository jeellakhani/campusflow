"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Activity, LayoutDashboard, FileText, Search, Calendar, MessageCircle, ShieldAlert, Bell, User, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden h-9 w-9">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs h-full w-[280px] p-0 rounded-none sm:rounded-none block border-0 m-0 translate-x-0 left-0">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg tracking-tight">CampusFlow</span>
          </Link>
        </div>
        <div className="py-4 overflow-y-auto h-[calc(100vh-3.5rem)]">
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
                  onClick={() => setOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
}

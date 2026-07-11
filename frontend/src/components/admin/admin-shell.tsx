"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Newspaper,
  Images,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/lib/admin-auth";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Mitglieder", href: "/admin/mitglieder", icon: Users },
  { title: "Veranstaltungen", href: "/admin/veranstaltungen", icon: CalendarDays },
  { title: "News", href: "/admin/news", icon: Newspaper },
  { title: "Galerie", href: "/admin/galerie", icon: Images },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Lädt...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-border bg-secondary/30 p-4">
        <div className="mb-8 px-2">
          <p className="font-semibold">Gewerbeverein Lensahn</p>
          <p className="text-xs text-muted-foreground">Admin Control Panel</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent hover:text-foreground",
                pathname === item.href && "bg-accent text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="px-2 text-xs text-muted-foreground">
            {user.name} · {user.role}
          </div>
          <button
            onClick={() => logout().then(() => router.push("/admin/login"))}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
            Abmelden
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

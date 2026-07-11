"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/lib/admin-auth";

interface Stats {
  members: number;
  events: number;
  posts: number;
  applications: number;
}

export default function AdminDashboardPage() {
  const { adminFetch } = useAdminAuth();
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    (async () => {
      const [members, events, posts, applications] = await Promise.all([
        adminFetch<{ total: number }>("/api/members"),
        adminFetch<unknown[]>("/api/events"),
        adminFetch<{ total: number }>("/api/posts"),
        adminFetch<unknown[]>("/api/forms/membership-applications").catch(() => []),
      ]);
      setStats({
        members: members.total,
        events: events.length,
        posts: posts.total,
        applications: applications.length,
      });
    })();
  }, [adminFetch]);

  const cards = [
    { label: "Mitglieder", value: stats?.members },
    { label: "Veranstaltungen", value: stats?.events },
    { label: "News-Beiträge", value: stats?.posts },
    { label: "Offene Anträge", value: stats?.applications },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold">{card.value ?? "…"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

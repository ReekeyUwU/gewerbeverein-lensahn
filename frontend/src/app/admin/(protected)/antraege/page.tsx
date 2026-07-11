"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth";

interface Application {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  category: string;
  message: string | null;
  status: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  SUBMITTED: "Eingegangen",
  IN_REVIEW: "In Prüfung",
  APPROVED: "Angenommen",
  REJECTED: "Abgelehnt",
};

export default function AdminApplicationsPage() {
  const { adminFetch } = useAdminAuth();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [contacts, setContacts] = React.useState<ContactSubmission[]>([]);

  async function load() {
    const [apps, msgs] = await Promise.all([
      adminFetch<Application[]>("/api/forms/membership-applications"),
      adminFetch<ContactSubmission[]>("/api/forms/contact"),
    ]);
    setApplications(apps);
    setContacts(msgs);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await adminFetch(`/api/forms/membership-applications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.success("Status aktualisiert");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aktualisieren fehlgeschlagen");
    }
  }

  async function deleteContact(id: string) {
    if (!confirm("Nachricht wirklich löschen?")) return;
    await adminFetch(`/api/forms/contact/${id}`, { method: "DELETE" });
    toast.success("Nachricht gelöscht");
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Mitgliedsanträge</h1>
      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {applications.map((app) => (
          <div key={app.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{app.companyName}</p>
              <p className="text-sm text-muted-foreground">
                {app.contactName} · {app.email} {app.phone ? `· ${app.phone}` : ""}
              </p>
              <Badge variant="secondary" className="mt-1">
                {app.category}
              </Badge>
              {app.message && <p className="mt-2 text-sm text-muted-foreground">{app.message}</p>}
            </div>
            <Select value={app.status} onValueChange={(v) => v && updateStatus(app.id, v)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue>{(value: string) => statusLabels[value] ?? value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        {applications.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Keine Mitgliedsanträge vorhanden.</p>
        )}
      </div>

      <h1 className="mt-12 text-2xl font-semibold">Kontaktanfragen</h1>
      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {contacts.map((msg) => (
          <div key={msg.id} className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-medium">
                {msg.name} · {msg.email}
              </p>
              {msg.subject && <p className="text-sm text-muted-foreground">{msg.subject}</p>}
              <p className="mt-2 text-sm text-muted-foreground">{msg.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(msg.createdAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => deleteContact(msg.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Keine Kontaktanfragen vorhanden.</p>
        )}
      </div>
    </div>
  );
}

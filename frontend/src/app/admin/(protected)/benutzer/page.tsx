"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "@/lib/admin-auth";

interface AdminUserEntry {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "REDAKTEUR" | "VORSTAND" | "MITGLIED" | "MODERATOR";
  isActive: boolean;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  REDAKTEUR: "Redakteur",
  VORSTAND: "Vorstand",
  MITGLIED: "Mitglied",
  MODERATOR: "Moderator",
};

export default function AdminUsersPage() {
  const { adminFetch, user: currentUser } = useAdminAuth();
  const [users, setUsers] = React.useState<AdminUserEntry[]>([]);
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState("REDAKTEUR");

  async function load() {
    setUsers(await adminFetch<AdminUserEntry[]>("/api/users"));
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      role,
    };

    try {
      await adminFetch("/api/users", { method: "POST", body: JSON.stringify(payload) });
      toast.success("Konto angelegt");
      setOpen(false);
      setRole("REDAKTEUR");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Anlegen fehlgeschlagen");
    }
  }

  async function toggleActive(u: AdminUserEntry) {
    try {
      await adminFetch(`/api/users/${u.id}`, { method: "PUT", body: JSON.stringify({ isActive: !u.isActive }) });
      toast.success(u.isActive ? "Konto deaktiviert" : "Konto aktiviert");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aktualisieren fehlgeschlagen");
    }
  }

  async function handleDelete(u: AdminUserEntry) {
    if (!confirm(`Konto "${u.name}" wirklich löschen?`)) return;
    try {
      await adminFetch(`/api/users/${u.id}`, { method: "DELETE" });
      toast.success("Konto gelöscht");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Benutzerkonten</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button onClick={() => setRole("REDAKTEUR")} />}>
            <Plus className="size-4" /> Neues Konto
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Neues Konto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" name="password" type="password" minLength={8} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rolle</Label>
                <Select value={role} onValueChange={(v) => setRole(v ?? "REDAKTEUR")}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue>{(value: string) => roleLabels[value] ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Anlegen</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">
                {u.name} {u.id === currentUser?.id && <span className="text-xs text-muted-foreground">(Du)</span>}
              </p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{roleLabels[u.role] ?? u.role}</Badge>
              <Badge variant={u.isActive ? "default" : "outline"}>{u.isActive ? "Aktiv" : "Deaktiviert"}</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                title={u.isActive ? "Deaktivieren" : "Aktivieren"}
                disabled={u.id === currentUser?.id}
                onClick={() => toggleActive(u)}
              >
                {u.isActive ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={u.id === currentUser?.id}
                onClick={() => handleDelete(u)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="p-4 text-sm text-muted-foreground">Keine Konten vorhanden.</p>}
      </div>
    </div>
  );
}

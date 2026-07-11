"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
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
import { useAdminAuth } from "@/lib/admin-auth";
import type { Sponsor } from "@/lib/server-api";

export default function AdminSponsorsPage() {
  const { adminFetch } = useAdminAuth();
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Sponsor | null>(null);

  async function load() {
    setSponsors(await adminFetch<Sponsor[]>("/api/sponsors"));
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
      logoUrl: String(form.get("logoUrl")),
      websiteUrl: String(form.get("websiteUrl") ?? ""),
      description: String(form.get("description") ?? ""),
      tier: String(form.get("tier") ?? "standard"),
    };

    try {
      if (editing) {
        await adminFetch(`/api/sponsors/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Sponsor aktualisiert");
      } else {
        await adminFetch("/api/sponsors", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Sponsor angelegt");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Sponsor wirklich löschen?")) return;
    await adminFetch(`/api/sponsors/${id}`, { method: "DELETE" });
    toast.success("Sponsor gelöscht");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sponsoren</h1>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditing(null);
          }}
        >
          <DialogTrigger render={<Button onClick={() => setEditing(null)} />}>
            <Plus className="size-4" /> Neuer Sponsor
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Sponsor bearbeiten" : "Neuer Sponsor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Logo-URL</Label>
                <Input id="logoUrl" name="logoUrl" defaultValue={editing?.logoUrl} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input id="websiteUrl" name="websiteUrl" defaultValue={editing?.websiteUrl ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tier">Stufe</Label>
                <Input id="tier" name="tier" defaultValue={editing?.tier ?? "standard"} />
              </div>
              <Button type="submit">{editing ? "Speichern" : "Anlegen"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sponsor.logoUrl} alt={sponsor.name} className="h-10 w-20 rounded bg-white object-contain p-1" />
              <p className="font-medium">{sponsor.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{sponsor.tier}</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setEditing(sponsor);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(sponsor.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {sponsors.length === 0 && <p className="p-4 text-sm text-muted-foreground">Keine Sponsoren vorhanden.</p>}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/lib/admin-auth";
import type { EventItem } from "@/lib/server-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export default function AdminEventsPage() {
  const { adminFetch, accessToken } = useAdminAuth();
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EventItem | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  async function load() {
    setEvents(await adminFetch<EventItem[]>("/api/events"));
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleImageUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      });
      if (!res.ok) throw new Error("Upload fehlgeschlagen");
      const { url } = await res.json();
      setImageUrl(url);
      toast.success("Bild hochgeladen");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title"));
    const payload = {
      title,
      slug: editing?.slug ?? slugify(title),
      description: String(form.get("description") ?? ""),
      location: String(form.get("location") ?? ""),
      startAt: new Date(String(form.get("startAt"))).toISOString(),
      maxParticipants: form.get("maxParticipants") ? Number(form.get("maxParticipants")) : undefined,
      imageUrl: imageUrl ?? editing?.imageUrl ?? undefined,
    };

    try {
      if (editing) {
        await adminFetch(`/api/events/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Veranstaltung aktualisiert");
      } else {
        await adminFetch("/api/events", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Veranstaltung angelegt");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Veranstaltung wirklich löschen?")) return;
    await adminFetch(`/api/events/${id}`, { method: "DELETE" });
    toast.success("Veranstaltung gelöscht");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Veranstaltungen</h1>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setEditing(null);
              setImageUrl(null);
            }
          }}
        >
          <DialogTrigger
            render={
              <Button
                onClick={() => {
                  setEditing(null);
                  setImageUrl(null);
                }}
              />
            }
          >
            <Plus className="size-4" /> Neue Veranstaltung
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Veranstaltung bearbeiten" : "Neue Veranstaltung"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titel</Label>
                <Input id="title" name="title" defaultValue={editing?.title} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startAt">Datum & Uhrzeit</Label>
                <Input
                  id="startAt"
                  name="startAt"
                  type="datetime-local"
                  defaultValue={toLocalInput(editing?.startAt)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Ort</Label>
                <Input id="location" name="location" defaultValue={editing?.location ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxParticipants">Max. Teilnehmende</Label>
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  defaultValue={editing?.maxParticipants ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea id="description" name="description" rows={4} defaultValue={editing?.description ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Bild</Label>
                {(imageUrl ?? editing?.imageUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl ?? editing?.imageUrl ?? ""}
                    alt=""
                    className="aspect-[4/3] w-full max-w-xs rounded-lg object-cover"
                  />
                )}
                <Label htmlFor="eventImage" className="flex w-fit cursor-pointer items-center gap-2 text-sm text-primary">
                  <Upload className="size-4" />
                  {uploading ? "Lädt hoch..." : "Bild auswählen"}
                </Label>
                <input
                  id="eventImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button type="submit">{editing ? "Speichern" : "Anlegen"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(event.startAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setEditing(event);
                  setImageUrl(null);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(event.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="p-4 text-sm text-muted-foreground">Keine Veranstaltungen vorhanden.</p>}
      </div>
    </div>
  );
}

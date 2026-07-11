"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload } from "lucide-react";
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
import type { Member } from "@/lib/server-api";

const categories = ["HANDWERK", "DIENSTLEISTUNG", "GASTRONOMIE", "HANDEL", "INDUSTRIE", "FREIE_BERUFE"];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminMembersPage() {
  const { adminFetch, accessToken } = useAdminAuth();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Member | null>(null);
  const [category, setCategory] = React.useState("HANDWERK");
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  async function load() {
    const res = await adminFetch<{ members: Member[] }>("/api/members?pageSize=100");
    setMembers(res.members);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogoUpload(file: File | null) {
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
      setLogoUrl(url);
      toast.success("Logo hochgeladen");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const companyName = String(form.get("companyName"));
    const payload = {
      companyName,
      slug: editing?.slug ?? slugify(companyName),
      category,
      description: String(form.get("description") ?? ""),
      street: String(form.get("street") ?? ""),
      city: String(form.get("city") ?? ""),
      zip: String(form.get("zip") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      website: String(form.get("website") ?? ""),
      logoUrl: logoUrl ?? editing?.logoUrl ?? undefined,
    };

    try {
      if (editing) {
        await adminFetch(`/api/members/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Mitglied aktualisiert");
      } else {
        await adminFetch("/api/members", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Mitglied angelegt");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Mitglied wirklich löschen?")) return;
    try {
      await adminFetch(`/api/members/${id}`, { method: "DELETE" });
      toast.success("Mitglied gelöscht");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mitglieder</h1>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setEditing(null);
              setLogoUrl(null);
            }
          }}
        >
          <DialogTrigger
            render={
              <Button
                onClick={() => {
                  setEditing(null);
                  setCategory("HANDWERK");
                  setLogoUrl(null);
                }}
              />
            }
          >
            <Plus className="size-4" /> Neues Mitglied
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Mitglied bearbeiten" : "Neues Mitglied"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Logo</Label>
                {(logoUrl ?? editing?.logoUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl ?? editing?.logoUrl ?? ""}
                    alt=""
                    className="h-20 w-32 rounded-lg bg-white object-contain p-2 ring-1 ring-border"
                  />
                )}
                <Label htmlFor="memberLogo" className="flex w-fit cursor-pointer items-center gap-2 text-sm text-primary">
                  <Upload className="size-4" />
                  {uploading ? "Lädt hoch..." : "Logo auswählen"}
                </Label>
                <input
                  id="memberLogo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyName">Unternehmen</Label>
                <Input id="companyName" name="companyName" defaultValue={editing?.companyName} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Branche</Label>
                <Select value={category} onValueChange={(v) => setCategory(v ?? "HANDWERK")}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Input id="description" name="description" defaultValue={editing?.description ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="street">Straße</Label>
                  <Input id="street" name="street" defaultValue={editing?.street ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zip">PLZ</Label>
                  <Input id="zip" name="zip" defaultValue={editing?.zip ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Ort</Label>
                  <Input id="city" name="city" defaultValue={editing?.city ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" name="phone" defaultValue={editing?.phone ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" name="email" type="email" defaultValue={editing?.email ?? ""} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" defaultValue={editing?.website ?? ""} />
                </div>
              </div>
              <Button type="submit">{editing ? "Speichern" : "Anlegen"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              {member.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.logoUrl} alt="" className="h-10 w-16 rounded bg-white object-contain p-1 ring-1 ring-border" />
              )}
              <div>
                <p className="font-medium">{member.companyName}</p>
                <p className="text-sm text-muted-foreground">
                  {[member.street, member.city].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{member.category}</Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setEditing(member);
                  setCategory(member.category);
                  setLogoUrl(null);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(member.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="p-4 text-sm text-muted-foreground">Keine Mitglieder vorhanden.</p>}
      </div>
    </div>
  );
}

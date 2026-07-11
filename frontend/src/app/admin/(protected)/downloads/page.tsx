"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/lib/admin-auth";
import type { DownloadItem } from "@/lib/server-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AdminDownloadsPage() {
  const { adminFetch, accessToken } = useAdminAuth();
  const [downloads, setDownloads] = React.useState<DownloadItem[]>([]);
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  async function load() {
    setDownloads(await adminFetch<DownloadItem[]>("/api/downloads"));
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title"));
    const category = String(form.get("category") ?? "");

    if (!file) {
      toast.error("Bitte eine Datei auswählen");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/uploads/file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      });
      if (!res.ok) throw new Error("Upload fehlgeschlagen");
      const { url } = await res.json();

      await adminFetch("/api/downloads", {
        method: "POST",
        body: JSON.stringify({ title, category, fileUrl: url, fileType: file.type }),
      });
      toast.success("Datei hochgeladen");
      setOpen(false);
      setFile(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Datei wirklich löschen?")) return;
    await adminFetch(`/api/downloads/${id}`, { method: "DELETE" });
    toast.success("Datei gelöscht");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Downloads</h1>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setFile(null);
          }}
        >
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" /> Neue Datei
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Neue Datei</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titel</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategorie</Label>
                <Input id="category" name="category" placeholder="z.B. Satzung, Formular" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file" className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                  <Upload className="size-4" />
                  {file ? file.name : "Datei auswählen"}
                </Label>
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Lädt hoch..." : "Hochladen"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {downloads.map((file) => (
          <div key={file.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{file.title}</p>
              {file.category && <p className="text-sm text-muted-foreground">{file.category}</p>}
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(file.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {downloads.length === 0 && <p className="p-4 text-sm text-muted-foreground">Keine Dateien vorhanden.</p>}
      </div>
    </div>
  );
}

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
import type { GalleryAlbum } from "@/lib/server-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminGalleryPage() {
  const { adminFetch, accessToken } = useAdminAuth();
  const [albums, setAlbums] = React.useState<GalleryAlbum[]>([]);
  const [open, setOpen] = React.useState(false);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);

  async function load() {
    setAlbums(await adminFetch<GalleryAlbum[]>("/api/gallery"));
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateAlbum(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title"));
    try {
      await adminFetch("/api/gallery", {
        method: "POST",
        body: JSON.stringify({ title, slug: slugify(title) }),
      });
      toast.success("Album angelegt");
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Anlegen fehlgeschlagen");
    }
  }

  async function handleUpload(albumId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingId(albumId);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        });
        if (!res.ok) throw new Error("Upload fehlgeschlagen");
        const { url } = await res.json();
        await adminFetch(`/api/gallery/${albumId}/images`, {
          method: "POST",
          body: JSON.stringify({ url }),
        });
      }
      toast.success("Bilder hochgeladen");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDeleteImage(imageId: string) {
    await adminFetch(`/api/gallery/images/${imageId}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Galerie</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" /> Neues Album
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Neues Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAlbum} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titel</Label>
                <Input id="title" name="title" required />
              </div>
              <Button type="submit">Anlegen</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 space-y-8">
        {albums.map((album) => (
          <div key={album.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{album.title}</h2>
              <Label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                <Upload className="size-4" />
                {uploadingId === album.id ? "Lädt hoch..." : "Bilder hochladen"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(album.id, e.target.files)}
                />
              </Label>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {album.images.map((image) => (
                <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {albums.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Alben angelegt.</p>}
      </div>
    </div>
  );
}

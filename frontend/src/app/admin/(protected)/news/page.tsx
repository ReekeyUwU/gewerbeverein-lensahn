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
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { Post } from "@/lib/server-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminNewsPage() {
  const { adminFetch, accessToken } = useAdminAuth();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Post | null>(null);
  const [status, setStatus] = React.useState("DRAFT");
  const [content, setContent] = React.useState("");
  const [coverImageUrl, setCoverImageUrl] = React.useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = React.useState(false);

  async function load() {
    const res = await adminFetch<{ posts: Post[] }>("/api/posts?pageSize=100");
    setPosts(res.posts);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCoverUpload(file: File | null) {
    if (!file) return;
    setUploadingCover(true);
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
      setCoverImageUrl(url);
      toast.success("Titelbild hochgeladen");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploadingCover(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setStatus("DRAFT");
    setContent("");
    setCoverImageUrl(null);
  }

  function openEdit(post: Post) {
    setEditing(post);
    setStatus(post.status);
    setContent(post.content);
    setCoverImageUrl(post.coverImageUrl);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title"));
    const payload = {
      title,
      slug: editing?.slug ?? slugify(title),
      excerpt: String(form.get("excerpt") ?? ""),
      content,
      coverImageUrl: coverImageUrl ?? undefined,
      category: String(form.get("category") ?? ""),
      status,
      publishedAt: status === "PUBLISHED" ? new Date().toISOString() : undefined,
    };

    if (!content || content === "<p></p>") {
      toast.error("Bitte einen Inhalt schreiben");
      return;
    }

    try {
      if (editing) {
        await adminFetch(`/api/posts/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Beitrag aktualisiert");
      } else {
        await adminFetch("/api/posts", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Beitrag angelegt");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Beitrag wirklich löschen?")) return;
    await adminFetch(`/api/posts/${id}`, { method: "DELETE" });
    toast.success("Beitrag gelöscht");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">News</h1>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditing(null);
          }}
        >
          <DialogTrigger render={<Button onClick={openCreate} />}>
            <Plus className="size-4" /> Neuer Beitrag
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Beitrag bearbeiten" : "Neuer Beitrag"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titel</Label>
                <Input id="title" name="title" defaultValue={editing?.title} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategorie</Label>
                <Input id="category" name="category" defaultValue={editing?.category ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excerpt">Kurzbeschreibung</Label>
                <Input id="excerpt" name="excerpt" defaultValue={editing?.excerpt ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Titelbild</Label>
                {coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImageUrl} alt="" className="aspect-[3/1] w-full rounded-lg object-cover" />
                )}
                <Label htmlFor="coverImage" className="flex w-fit cursor-pointer items-center gap-2 text-sm text-primary">
                  <Upload className="size-4" />
                  {uploadingCover ? "Lädt hoch..." : "Titelbild auswählen"}
                </Label>
                <input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCoverUpload(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Inhalt</Label>
                <RichTextEditor content={content} onChange={setContent} accessToken={accessToken} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v ?? "DRAFT")}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue>{(value: string) => statusLabels[value] ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Entwurf</SelectItem>
                    <SelectItem value="PUBLISHED">Veröffentlicht</SelectItem>
                    <SelectItem value="ARCHIVED">Archiviert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">{editing ? "Speichern" : "Anlegen"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{post.title}</p>
              {post.excerpt && <p className="text-sm text-muted-foreground">{post.excerpt}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{post.category ?? "—"}</Badge>
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(post)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(post.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="p-4 text-sm text-muted-foreground">Keine Beiträge vorhanden.</p>}
      </div>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  ARCHIVED: "Archiviert",
};

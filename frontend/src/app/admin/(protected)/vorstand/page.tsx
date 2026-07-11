"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
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
import type { BoardMemberEntry } from "@/lib/server-api";

export default function AdminBoardPage() {
  const { adminFetch } = useAdminAuth();
  const [board, setBoard] = React.useState<BoardMemberEntry[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BoardMemberEntry | null>(null);

  async function load() {
    setBoard(await adminFetch<BoardMemberEntry[]>("/api/board"));
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
      position: String(form.get("position")),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
    };

    try {
      if (editing) {
        await adminFetch(`/api/board/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Vorstandsmitglied aktualisiert");
      } else {
        await adminFetch("/api/board", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Vorstandsmitglied angelegt");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Vorstandsmitglied wirklich löschen?")) return;
    await adminFetch(`/api/board/${id}`, { method: "DELETE" });
    toast.success("Vorstandsmitglied gelöscht");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vorstand</h1>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditing(null);
          }}
        >
          <DialogTrigger render={<Button onClick={() => setEditing(null)} />}>
            <Plus className="size-4" /> Neues Mitglied
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editing ? "Vorstandsmitglied bearbeiten" : "Neues Vorstandsmitglied"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" defaultValue={editing?.position} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" defaultValue={editing?.email ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" defaultValue={editing?.phone ?? ""} />
              </div>
              <Button type="submit">{editing ? "Speichern" : "Anlegen"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 divide-y divide-border rounded-xl border border-border">
        {board.map((person) => (
          <div key={person.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{person.name}</p>
              <p className="text-sm text-muted-foreground">{person.position}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setEditing(person);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(person.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {board.length === 0 && <p className="p-4 text-sm text-muted-foreground">Kein Vorstand hinterlegt.</p>}
      </div>
    </div>
  );
}

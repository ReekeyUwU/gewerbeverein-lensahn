"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export function EventRegistrationForm({ eventId }: { eventId: string }) {
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await apiFetch(`/api/events/${eventId}/register`, {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          guests: Number(form.get("guests") ?? 0),
        }),
      });
      setDone(true);
      toast.success("Anmeldung erfolgreich!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-xl bg-secondary/60 p-4 text-sm">
        Danke für deine Anmeldung! Wir freuen uns auf dich.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-border p-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="guests">Begleitpersonen</Label>
        <Input id="guests" name="guests" type="number" min={0} defaultValue={0} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Wird gesendet..." : "Verbindlich anmelden"}
      </Button>
    </form>
  );
}

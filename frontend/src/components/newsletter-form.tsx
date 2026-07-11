"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/api/forms/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success("Danke! Bitte bestätige deine Anmeldung per E-Mail.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
      <Input
        type="email"
        required
        placeholder="Deine E-Mail-Adresse"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="E-Mail für Newsletter"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "..." : "Abonnieren"}
      </Button>
    </form>
  );
}

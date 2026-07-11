"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";

const categories = [
  { value: "HANDWERK", label: "Handwerk" },
  { value: "DIENSTLEISTUNG", label: "Dienstleistung" },
  { value: "GASTRONOMIE", label: "Gastronomie" },
  { value: "HANDEL", label: "Handel" },
  { value: "INDUSTRIE", label: "Industrie" },
  { value: "FREIE_BERUFE", label: "Freie Berufe" },
];

export function MembershipApplicationForm() {
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [category, setCategory] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await apiFetch("/api/forms/membership-applications", {
        method: "POST",
        body: JSON.stringify({
          companyName: form.get("companyName"),
          contactName: form.get("contactName"),
          email: form.get("email"),
          phone: form.get("phone"),
          category,
          message: form.get("message"),
        }),
      });
      setSubmitted(true);
      toast.success("Antrag erfolgreich eingereicht!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Antrag konnte nicht gesendet werden");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/40 p-8 text-center">
        <h3 className="text-xl font-semibold">Danke für deinen Antrag!</h3>
        <p className="mt-2 text-muted-foreground">
          Wir haben deine Anfrage erhalten und melden uns in Kürze per E-Mail bei dir.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-border p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="companyName">Unternehmen</Label>
          <Input id="companyName" name="companyName" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactName">Ansprechpartner:in</Label>
          <Input id="contactName" name="contactName" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="category">Branche</Label>
          <Select value={category} onValueChange={(value) => setCategory(value ?? "")} required>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Branche auswählen">
                {(value: string) => categories.find((c) => c.value === value)?.label ?? "Branche auswählen"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="message">Nachricht (optional)</Label>
          <Textarea id="message" name="message" rows={4} />
        </div>
      </div>
      <Button type="submit" size="lg" disabled={loading || !category}>
        {loading ? "Wird gesendet..." : "Mitgliedsantrag senden"}
      </Button>
    </form>
  );
}

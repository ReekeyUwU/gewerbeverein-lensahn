"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [loading, setLoading] = React.useState(false);
  const [needsTotp, setNeedsTotp] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const result = await login(
        String(form.get("email")),
        String(form.get("password")),
        form.get("totpCode") ? String(form.get("totpCode")) : undefined,
      );
      if (result.requiresTwoFactor) {
        setNeedsTotp(true);
        toast.info("Bitte gib deinen 2FA-Code ein");
        return;
      }
      router.push("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border p-8">
        <h1 className="text-xl font-semibold">Admin-Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gewerbeverein Lensahn e.V.</p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Passwort</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {needsTotp && (
            <div className="grid gap-2">
              <Label htmlFor="totpCode">2FA-Code</Label>
              <Input id="totpCode" name="totpCode" inputMode="numeric" autoFocus />
            </div>
          )}
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? "Anmelden..." : "Anmelden"}
        </Button>
      </form>
    </div>
  );
}

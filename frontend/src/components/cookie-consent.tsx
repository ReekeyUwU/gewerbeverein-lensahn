"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";

type Consent = "accepted" | "rejected";

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);

    const openHandler = () => setVisible(true);
    window.addEventListener("open-cookie-settings", openHandler);
    return () => window.removeEventListener("open-cookie-settings", openHandler);
  }, []);

  function choose(consent: Consent) {
    window.localStorage.setItem(STORAGE_KEY, consent);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-xl sm:inset-x-auto sm:right-4">
      <p className="text-sm">
        Wir verwenden technisch notwendige Cookies sowie optionale Cookies für Statistik und Komfort. Mehr dazu in
        unserer <a href="/datenschutz" className="underline">Datenschutzerklärung</a>.
      </p>
      <div className="mt-4 flex gap-3">
        <Button size="sm" onClick={() => choose("accepted")}>
          Alle akzeptieren
        </Button>
        <Button size="sm" variant="outline" onClick={() => choose("rejected")}>
          Nur notwendige
        </Button>
      </div>
    </div>
  );
}

export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
      className="hover:text-foreground"
    >
      Cookie-Einstellungen
    </button>
  );
}

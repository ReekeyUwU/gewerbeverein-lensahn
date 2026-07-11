import type { Metadata } from "next";
import { getSponsors } from "@/lib/server-api";
import { supportContent, associationFacts } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Partner & Sponsoren",
  description: "Partner, Sponsoren und Unterstützungsmöglichkeiten für den Gewerbeverein Lensahn e.V.",
};

export default async function PartnersPage() {
  const sponsors = await getSponsors();

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Partner & Sponsoren</h1>

      {sponsors.length > 0 ? (
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.websiteUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex h-24 items-center justify-center rounded-xl p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-12 max-w-full object-contain" />
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-sm text-muted-foreground">Noch keine Sponsoren hinterlegt.</p>
      )}

      <section className="mt-20 rounded-2xl border border-border p-8">
        <h2 className="text-2xl font-semibold">So kannst du uns unterstützen</h2>
        <ul className="mt-6 space-y-3">
          {supportContent.actions.map((action) => (
            <li key={action} className="flex items-start gap-3 text-sm">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
              {action}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">{supportContent.closing}</p>
        <div className="mt-6 rounded-xl bg-secondary/60 p-4 text-sm">
          <p>Spendenkonto: {associationFacts.iban}</p>
          <p className="mt-1">
            Kontakt: <a href={`mailto:${associationFacts.email}`} className="underline">{associationFacts.email}</a>
          </p>
        </div>
      </section>
    </div>
  );
}

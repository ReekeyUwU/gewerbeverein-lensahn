import type { Metadata } from "next";
import { associationFacts } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false },
};

export default function ImprintPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Impressum</h1>

      <section className="mt-10 space-y-2 text-sm">
        <p className="font-medium">Angaben gemäß § 5 TMG</p>
        <p>{associationFacts.name}</p>
        <p>{associationFacts.addressLine1}</p>
        <p>{associationFacts.addressLine2}</p>
        <p>{associationFacts.addressLine3}</p>
      </section>

      <section className="mt-8 space-y-2 text-sm">
        <p className="font-medium">Vertreten durch</p>
        <p>{associationFacts.chair} ({associationFacts.chairRole})</p>
      </section>

      <section className="mt-8 space-y-2 text-sm">
        <p className="font-medium">Kontakt</p>
        <p>E-Mail: {associationFacts.email}</p>
      </section>

      <section className="mt-8 space-y-2 text-sm">
        <p className="font-medium">Registereintrag</p>
        <p className="text-muted-foreground">
          Vereinsregisternummer und zuständiges Registergericht bitte ergänzen (noch nicht hinterlegt).
        </p>
      </section>

      <section className="mt-8 space-y-2 text-sm">
        <p className="font-medium">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</p>
        <p>{associationFacts.chair}, {associationFacts.addressLine2}, {associationFacts.addressLine3}</p>
      </section>

      <section className="mt-8 space-y-2 text-sm">
        <p className="font-medium">EU-Streitschlichtung</p>
        <p className="text-muted-foreground">
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          https://ec.europa.eu/consumers/odr/. Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.
        </p>
      </section>
    </div>
  );
}

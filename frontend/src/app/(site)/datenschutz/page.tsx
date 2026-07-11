import type { Metadata } from "next";
import { associationFacts } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Datenschutzerklärung</h1>

      <div className="mt-10 space-y-8 text-sm text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Verantwortlicher</h2>
          <p className="mt-2">
            {associationFacts.name}, {associationFacts.addressLine2}, {associationFacts.addressLine3}, E-Mail:{" "}
            {associationFacts.email}.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Erhebung und Speicherung personenbezogener Daten</h2>
          <p className="mt-2">
            Beim Besuch unserer Website erhebt unser Hosting-Provider automatisch Informationen in Server-Log-Dateien
            (u. a. IP-Adresse, Datum und Uhrzeit der Anfrage, verwendeter Browser). Diese Daten sind technisch
            erforderlich und werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeitet.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Kontaktformular & Mitgliedsantrag</h2>
          <p className="mt-2">
            Wenn Du uns per Kontaktformular oder Mitgliedsantrag Anfragen zukommen lässt, werden Deine Angaben
            inklusive der von Dir angegebenen Kontaktdaten zur Bearbeitung der Anfrage und für den Fall von
            Anschlussfragen gespeichert (Art. 6 Abs. 1 lit. b DSGVO). Diese Daten geben wir nicht ohne Deine
            Einwilligung weiter.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Newsletter</h2>
          <p className="mt-2">
            Für den Versand unseres Newsletters verwenden wir das Double-Opt-In-Verfahren: Du erhältst nach
            Anmeldung eine Bestätigungs-E-Mail. Erst nach Bestätigung wird Deine Adresse in den Verteiler
            aufgenommen (Art. 6 Abs. 1 lit. a DSGVO). Du kannst den Newsletter jederzeit über den Abmeldelink
            abbestellen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Cookies</h2>
          <p className="mt-2">
            Unsere Website verwendet technisch notwendige Cookies für den Betrieb der Seite sowie – nach
            Deiner Einwilligung über den Cookie-Banner – optionale Cookies für Statistik und Komfortfunktionen.
            Du kannst Deine Auswahl jederzeit über die Cookie-Einstellungen im Footer anpassen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Deine Rechte</h2>
          <p className="mt-2">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
            Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung Deiner personenbezogenen Daten.
            Wende Dich hierzu an {associationFacts.email}. Zudem besteht ein Beschwerderecht bei der zuständigen
            Datenschutzaufsichtsbehörde.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Speicherdauer</h2>
          <p className="mt-2">
            Personenbezogene Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich
            ist oder gesetzliche Aufbewahrungsfristen dies vorschreiben.
          </p>
        </section>
      </div>
    </div>
  );
}

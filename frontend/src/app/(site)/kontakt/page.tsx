import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { InstagramIcon } from "@/components/social-icons";
import { associationFacts } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktiere den Gewerbeverein Lensahn e.V.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Kontakt</h1>
      <p className="mt-4 text-muted-foreground">Wir freuen uns auf Deine Nachricht!</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 text-primary" />
            <div className="text-sm">
              <p className="font-medium">{associationFacts.name}</p>
              <p>{associationFacts.addressLine1}</p>
              <p>{associationFacts.addressLine2}</p>
              <p>{associationFacts.addressLine3}</p>
            </div>
          </div>
          <a href={`mailto:${associationFacts.email}`} className="flex items-center gap-3 text-sm hover:text-primary">
            <Mail className="size-5 text-primary" />
            {associationFacts.email}
          </a>
          <a
            href={associationFacts.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm hover:text-primary"
          >
            <InstagramIcon className="size-5 text-primary" />
            @gewerbevereinlensahn
          </a>
          <p className="text-sm text-muted-foreground">
            Ansprechpartner: {associationFacts.chair} ({associationFacts.chairRole})
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}

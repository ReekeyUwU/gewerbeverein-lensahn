import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMember } from "@/lib/server-api";

const categoryLabels: Record<string, string> = {
  HANDWERK: "Handwerk",
  DIENSTLEISTUNG: "Dienstleistung",
  GASTRONOMIE: "Gastronomie",
  HANDEL: "Handel",
  INDUSTRIE: "Industrie",
  FREIE_BERUFE: "Freie Berufe",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getMember(slug);
  return { title: member?.companyName ?? "Mitglied" };
}

export default async function MemberDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getMember(slug);

  if (!member) notFound();

  const address = [member.street, member.zip && member.city ? `${member.zip} ${member.city}` : member.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      {member.logoUrl && (
        <div className="mb-8 flex h-48 w-full max-w-sm items-center justify-center rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={member.logoUrl} alt={member.companyName} className="max-h-full max-w-full object-contain" />
        </div>
      )}
      <Badge variant="secondary">{categoryLabels[member.category] ?? member.category}</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{member.companyName}</h1>

      {member.description && <p className="mt-6 max-w-2xl text-muted-foreground">{member.description}</p>}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {address && (
          <div className="flex items-center gap-3 rounded-xl border border-border p-4">
            <MapPin className="size-5 text-primary" />
            <span className="text-sm">{address}</span>
          </div>
        )}
        {member.phone && (
          <a href={`tel:${member.phone}`} className="flex items-center gap-3 rounded-xl border border-border p-4">
            <Phone className="size-5 text-primary" />
            <span className="text-sm">{member.phone}</span>
          </a>
        )}
        {member.email && (
          <a href={`mailto:${member.email}`} className="flex items-center gap-3 rounded-xl border border-border p-4">
            <Mail className="size-5 text-primary" />
            <span className="text-sm">{member.email}</span>
          </a>
        )}
        {member.website && (
          <a
            href={member.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border p-4"
          >
            <Globe className="size-5 text-primary" />
            <span className="text-sm">{member.website}</span>
          </a>
        )}
      </div>

      {member.images.length > 0 && (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {member.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={image.url}
              alt={image.altText ?? member.companyName}
              className="aspect-square w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}

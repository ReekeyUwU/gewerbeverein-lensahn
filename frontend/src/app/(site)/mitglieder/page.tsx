import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemberFilters } from "@/components/member-filters";
import { getMembers } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Mitglieder",
  description: "Alle Mitgliedsunternehmen des Gewerbeverein Lensahn e.V.",
};

const categoryLabels: Record<string, string> = {
  HANDWERK: "Handwerk",
  DIENSTLEISTUNG: "Dienstleistung",
  GASTRONOMIE: "Gastronomie",
  HANDEL: "Handel",
  INDUSTRIE: "Industrie",
  FREIE_BERUFE: "Freie Berufe",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;
  const { members, total } = await getMembers({ category, search, pageSize: "50" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Mitgliedsunternehmen</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {total} Unternehmen aus Handwerk, Handel, Gastronomie, Dienstleistung und freien Berufen tragen den
        Gewerbeverein Lensahn e.V.
      </p>

      <div className="mt-10">
        <MemberFilters />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground">Keine Unternehmen gefunden.</p>
        )}
        {members.map((member) => (
          <Link key={member.id} href={`/mitglieder/${member.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardContent className="flex h-full flex-col gap-3 p-6">
                {member.logoUrl && (
                  <div className="flex h-40 items-center justify-center rounded-lg bg-white p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.logoUrl}
                      alt={member.companyName}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{categoryLabels[member.category] ?? member.category}</Badge>
                  {member.isPremium && <Badge>Premium</Badge>}
                </div>
                <h3 className="text-lg font-semibold">{member.companyName}</h3>
                {(member.street || member.city) && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {[member.street, member.zip && member.city ? `${member.zip} ${member.city}` : member.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

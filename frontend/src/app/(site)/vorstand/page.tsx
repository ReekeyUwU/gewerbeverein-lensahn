import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getBoardMembers } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Vorstand",
  description: "Der Vorstand des Gewerbeverein Lensahn e.V.",
};

export default async function BoardPage() {
  const board = await getBoardMembers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Vorstand</h1>
      <p className="mt-4 text-muted-foreground">
        Der ehrenamtliche Vorstand vertritt die Interessen aller Mitgliedsunternehmen.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {board.map((person) => (
          <Card key={person.id}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">{person.name}</h3>
              <p className="text-sm text-primary">{person.position}</p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {person.email && (
                  <a href={`mailto:${person.email}`} className="flex items-center gap-2 hover:text-foreground">
                    <Mail className="size-4" /> {person.email}
                  </a>
                )}
                {person.phone && (
                  <a href={`tel:${person.phone}`} className="flex items-center gap-2 hover:text-foreground">
                    <Phone className="size-4" /> {person.phone}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

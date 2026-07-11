import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getEvents } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Veranstaltungen",
  description: "Termine und Veranstaltungen des Gewerbeverein Lensahn e.V.",
};

export default async function EventsPage() {
  const events = await getEvents();
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.startAt).getTime() >= now);
  const past = events.filter((e) => new Date(e.startAt).getTime() < now);

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Veranstaltungen</h1>
      <p className="mt-4 text-muted-foreground">
        Stammtische, Workshops und Feste – hier findet ihr alle kommenden Termine des Vereins.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Kommende Termine</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Aktuell keine Termine geplant.</p>}
          {upcoming.map((event) => (
            <Link key={event.id} href={`/veranstaltungen/${event.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                {event.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.imageUrl} alt={event.title} className="aspect-[4/3] w-full object-cover" />
                )}
                <CardContent className="flex flex-col gap-2 p-6">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {new Date(event.startAt).toLocaleString("de-DE", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-muted-foreground">Vergangene Veranstaltungen</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {past.map((event) => (
              <Link key={event.id} href={`/veranstaltungen/${event.slug}`}>
                <Card className="h-full overflow-hidden opacity-70 transition-opacity hover:opacity-100">
                  {event.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.imageUrl} alt={event.title} className="aspect-[4/3] w-full object-cover" />
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(event.startAt).toLocaleDateString("de-DE", { dateStyle: "long" })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

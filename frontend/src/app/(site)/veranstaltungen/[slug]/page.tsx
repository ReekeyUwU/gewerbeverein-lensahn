import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { getEvent } from "@/lib/server-api";
import { EventRegistrationForm } from "@/components/event-registration-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return { title: event?.title ?? "Veranstaltung" };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{event.title}</h1>

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          {new Date(event.startAt).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })}
        </span>
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {event.location}
          </span>
        )}
        {event.maxParticipants && (
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            max. {event.maxParticipants} Teilnehmende
          </span>
        )}
      </div>

      {event.description && <p className="mt-8 whitespace-pre-line text-muted-foreground">{event.description}</p>}

      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Anmeldung</h2>
        <EventRegistrationForm eventId={event.id} />
      </div>
    </div>
  );
}

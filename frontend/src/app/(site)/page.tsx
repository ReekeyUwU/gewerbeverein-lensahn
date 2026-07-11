import Link from "next/link";
import { ArrowRight, CalendarDays, Handshake, Newspaper, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion-fade-in";
import { getEvents, getMembers, getPosts } from "@/lib/server-api";
import { aboutContent } from "@/lib/site-content";

export default async function HomePage() {
  const [{ members, total: memberCount }, events, { posts }] = await Promise.all([
    getMembers(),
    getEvents(true),
    getPosts(),
  ]);

  const upcomingEvents = events.slice(0, 3);
  const latestPosts = posts.slice(0, 3);
  const featuredMembers = members.slice(0, 8);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary),transparent_85%),transparent_60%),radial-gradient(circle_at_80%_0%,color-mix(in_oklch,var(--primary),transparent_90%),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-36">
          <FadeIn>
            <Badge variant="secondary" className="mb-6">
              Gegründet 2025 · Lensahn, Ostholstein
            </Badge>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Aus Lensahn <span className="text-primary">–</span> Für Lensahn
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Der Gewerbeverein Lensahn e.V. verbindet Unternehmen vor Ort, stärkt die Region und sorgt
              gemeinsam dafür, dass Lensahn l(i)ebenswert bleibt.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" render={<Link href="/mitglied-werden" />}>
                Mitglied werden
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/mitglieder" />}>
                Unternehmen entdecken
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { label: "Mitgliedsunternehmen", value: `${memberCount || 26}+`, icon: Users },
            { label: "Veranstaltungen pro Jahr", value: "6+", icon: CalendarDays },
            { label: "Gegründet", value: "2025", icon: Handshake },
            { label: "Presseberichte", value: "4+", icon: Newspaper },
          ].map((stat) => (
            <FadeIn key={stat.label}>
              <div className="flex flex-col items-start gap-2">
                <stat.icon className="size-6 text-primary" />
                <span className="text-3xl font-semibold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Warum es uns gibt</h2>
            <p className="mt-4 text-muted-foreground">{aboutContent.mission}</p>
            <p className="mt-4 text-muted-foreground">{aboutContent.closing}</p>
            <Button variant="link" className="mt-4 px-0" render={<Link href="/ueber-uns" />}>
              Mehr über uns erfahren <ArrowRight className="size-4" />
            </Button>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Card className="glass">
              <CardContent className="grid gap-4 p-6">
                {aboutContent.goals.slice(0, 5).map((goal) => (
                  <div key={goal} className="flex items-start gap-3">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Kommende Veranstaltungen</h2>
            <p className="mt-2 text-muted-foreground">Trefft euch, tauscht euch aus, gestaltet mit.</p>
          </div>
          <Button variant="outline" render={<Link href="/veranstaltungen" />}>
            Alle Termine
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">Aktuell sind keine Termine hinterlegt.</p>
          )}
          {upcomingEvents.map((event, i) => (
            <FadeIn key={event.id} delay={i * 0.05}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <Badge variant="secondary" className="w-fit">
                    {new Date(event.startAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </Badge>
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
                  <Button
                    variant="link"
                    className="mt-auto px-0"
                    render={<Link href={`/veranstaltungen/${event.slug}`} />}
                  >
                    Details ansehen <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      {featuredMembers.length > 0 && (
        <section className="border-t border-border bg-secondary/40 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Unsere Mitgliedsunternehmen</h2>
              <Button variant="outline" render={<Link href="/mitglieder" />}>
                Alle Mitglieder
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/mitglieder/${member.slug}`}
                  className="glass flex h-24 items-center justify-center rounded-xl px-4 text-center text-sm font-medium transition-transform hover:-translate-y-0.5"
                >
                  {member.companyName}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Neuigkeiten</h2>
          <Button variant="outline" render={<Link href="/neuigkeiten" />}>
            Alle Beiträge
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.length === 0 && (
            <p className="text-sm text-muted-foreground">Noch keine Beiträge veröffentlicht.</p>
          )}
          {latestPosts.map((post) => (
            <Card key={post.id} className="h-full">
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                {post.excerpt && <p className="text-sm text-muted-foreground">{post.excerpt}</p>}
                <Button variant="link" className="mt-auto px-0" render={<Link href={`/neuigkeiten/${post.slug}`} />}>
                  Weiterlesen <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Werde Teil des Netzwerks</h2>
          <p className="mt-4 text-muted-foreground">
            Gemeinsam gestalten wir die Zukunft Lensahns – als starke Stimme für den lokalen Handel und das
            Handwerk.
          </p>
          <Button size="lg" className="mt-8" render={<Link href="/mitglied-werden" />}>
            Jetzt Mitglied werden
          </Button>
        </div>
      </section>
    </div>
  );
}

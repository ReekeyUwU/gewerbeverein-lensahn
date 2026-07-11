import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Handshake, Newspaper, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Float } from "@/components/motion-fade-in";
import { CountUp } from "@/components/count-up";
import { LogoMarquee } from "@/components/logo-marquee";
import { getEvents, getMembers, getPosts } from "@/lib/server-api";
import { aboutContent } from "@/lib/site-content";

function shuffle<T>(input: T[]): T[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default async function HomePage() {
  const [{ members, total: memberCount }, events, { posts }] = await Promise.all([
    getMembers({ pageSize: "50" }),
    getEvents(true),
    getPosts(),
  ]);

  const upcomingEvents = events.slice(0, 3);
  const latestPosts = posts.slice(0, 3);
  const featuredMembers = shuffle(members).slice(0, 8);

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <Image
          src="/brand/hero-lake.jpg"
          alt="See bei Lensahn"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-x-0 top-0 -z-10 h-2 bg-primary" aria-hidden />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-28 sm:px-6 lg:grid-cols-[3fr_2fr] lg:px-8 lg:py-40">
          <div>
            <FadeIn>
              <Badge className="mb-6 border-none bg-primary text-primary-foreground">
                🦌 Gegründet 2025 · Lensahn, Ostholstein
              </Badge>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-lg font-medium text-primary-foreground/90 drop-shadow-sm">Schön, dass Du da bist!</p>
              <h1 className="mt-2 max-w-3xl text-5xl font-semibold tracking-tight text-balance text-white drop-shadow-sm sm:text-6xl">
                Aus Lensahn <span className="text-primary">–</span> Für Lensahn
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-6 max-w-xl text-lg text-white/85 drop-shadow-sm">
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
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                  render={<Link href="/mitglieder" />}
                >
                  Unternehmen entdecken
                </Button>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.1} className="hidden justify-self-center lg:block">
            <Float>
              <Image
                src="/brand/hirsch-lenni.png"
                alt="Hirsch Lenni, das Maskottchen des Gewerbeverein Lensahn"
                width={640}
                height={640}
                className="w-72 drop-shadow-2xl"
                priority
              />
            </Float>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 text-primary-foreground sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { label: "Mitgliedsunternehmen", value: memberCount || 26, suffix: "+", icon: Users },
            { label: "Veranstaltungen pro Jahr", value: 6, suffix: "+", icon: CalendarDays },
            { label: "Gegründet", value: 2025, suffix: "", icon: Handshake },
            { label: "Presseberichte", value: 4, suffix: "+", icon: Newspaper },
          ].map((stat) => (
            <FadeIn key={stat.label}>
              <div className="flex flex-col items-start gap-2">
                <stat.icon className="size-6" />
                <span className="text-3xl font-semibold">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-sm text-primary-foreground/80">{stat.label}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {members.length > 0 && (
        <section className="border-b border-border bg-secondary/30 py-10">
          <p className="mx-auto mb-6 max-w-7xl px-4 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase sm:px-6 lg:px-8">
            Getragen von {members.length} Unternehmen aus Lensahn
          </p>
          <LogoMarquee members={members} />
        </section>
      )}

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
            <Card className="club-card overflow-hidden !p-0">
              <div className="relative h-40 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/hero-lake.jpg" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Image
                  src="/legacy-photos/icon-ziele.png"
                  alt="Ziele-Symbol"
                  width={640}
                  height={640}
                  className="absolute bottom-2 right-2 size-14 object-contain drop-shadow-lg"
                />
              </div>
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
                  className="club-card flex h-28 items-center justify-center rounded-xl bg-white p-4 transition-transform hover:-translate-y-0.5 hover:border-primary/40"
                >
                  {member.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.logoUrl}
                      alt={member.companyName}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-center text-sm font-medium">{member.companyName}</span>
                  )}
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
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Werde Teil des Netzwerks</h2>
            <p className="mt-4 text-muted-foreground">
              Gemeinsam gestalten wir die Zukunft Lensahns – als starke Stimme für den lokalen Handel und das
              Handwerk.
            </p>
            <Button size="lg" className="mt-8" render={<Link href="/mitglied-werden" />}>
              Jetzt Mitglied werden
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/community-moin.png"
            alt="Moin! Gemeinsam als Gewerbeverein Lensahn"
            className="mx-auto size-56 rounded-full object-contain sm:size-64"
          />
        </div>
      </section>
    </div>
  );
}

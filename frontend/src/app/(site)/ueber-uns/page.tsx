import type { Metadata } from "next";
import { FadeIn } from "@/components/motion-fade-in";
import { aboutContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Geschichte, Mission und Ziele des Gewerbeverein Lensahn e.V.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Über uns</h1>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Geschichte</h2>
          {aboutContent.history.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="mt-12 rounded-2xl bg-secondary/60 p-8">
          <h2 className="text-2xl font-semibold">Unsere Mission</h2>
          <p className="mt-4 text-lg font-medium">{aboutContent.mission}</p>
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Unsere Ziele</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {aboutContent.goals.map((goal) => (
              <li key={goal} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <span className="text-sm">{goal}</span>
              </li>
            ))}
          </ul>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Warum ist der Verein wichtig?</h2>
          <p className="mt-4 text-muted-foreground">{aboutContent.closing}</p>
        </section>
      </FadeIn>
    </div>
  );
}

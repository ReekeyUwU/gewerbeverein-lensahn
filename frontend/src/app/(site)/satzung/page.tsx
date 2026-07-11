import type { Metadata } from "next";
import { satzungContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Satzung",
  description: "Satzung des Gewerbeverein Lensahn e.V.",
};

export default function SatzungPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Satzung</h1>
      <p className="mt-4 text-sm text-muted-foreground">Stand: {satzungContent.updated}</p>

      <div className="mt-12 space-y-10">
        {satzungContent.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <ul className="mt-4 space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

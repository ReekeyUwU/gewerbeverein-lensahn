import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { FadeIn } from "@/components/motion-fade-in";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MembershipApplicationForm } from "@/components/membership-application-form";
import { membershipContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Mitglied werden",
  description: "Vorteile einer Mitgliedschaft im Gewerbeverein Lensahn e.V. und Online-Antrag.",
};

export default function MembershipPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Warum Mitglied werden?</h1>
          <p className="mt-6 text-lg text-muted-foreground">{membershipContent.intro}</p>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {membershipContent.benefits.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.05}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <Check className="size-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">{membershipContent.perks}</p>

        <div className="mt-16 overflow-hidden rounded-2xl border border-border">
          <Image
            src="/legacy-photos/mitgliedschaft-vorteile-infografik.png"
            alt="Übersicht: Vorteile einer Mitgliedschaft im Gewerbeverein Lensahn"
            width={2000}
            height={1414}
            className="w-full object-contain"
          />
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">Beiträge & Voraussetzungen</h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Jahresbeitrag</dt>
              <dd className="text-xl font-semibold">{membershipContent.costs.annualFee}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Aufnahmegebühr</dt>
              <dd className="text-xl font-semibold">{membershipContent.costs.registrationFee}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Existenzgründer:innen</dt>
              <dd className="text-base">{membershipContent.costs.youngEntrepreneurs}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Härtefälle</dt>
              <dd className="text-base">{membershipContent.costs.hardship}</dd>
            </div>
          </dl>
          <p className="mt-8 text-sm text-muted-foreground">{membershipContent.eligibility}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Image
            src="/legacy-photos/icon-faq.png"
            alt="FAQ-Symbol"
            width={640}
            height={640}
            className="size-14 shrink-0 object-contain"
          />
          <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
        </div>
        <Accordion className="mt-8">
          {membershipContent.faq.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section id="antrag" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Jetzt Mitglied werden</h2>
        <p className="mt-2 text-muted-foreground">
          Fülle den Online-Antrag aus – wir melden uns anschließend per E-Mail mit den nächsten Schritten.
        </p>
        <div className="mt-8">
          <MembershipApplicationForm />
        </div>
      </section>
    </div>
  );
}

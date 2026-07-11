import Link from "next/link";
import { footerNav, siteConfig } from "@/lib/site-config";
import { NewsletterForm } from "@/components/newsletter-form";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/social-icons";
import { CookieSettingsLink } from "@/components/cookie-consent";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div>
            <div className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                GL
              </span>
              <span>{siteConfig.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{siteConfig.description}</p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="#" aria-label="Instagram" className="rounded-full border border-border p-2 hover:bg-accent">
                <InstagramIcon className="size-4" />
              </Link>
              <Link href="#" aria-label="Facebook" className="rounded-full border border-border p-2 hover:bg-accent">
                <FacebookIcon className="size-4" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="rounded-full border border-border p-2 hover:bg-accent">
                <LinkedinIcon className="size-4" />
              </Link>
            </div>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <ul className="mt-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
            <CookieSettingsLink />
          </div>
        </div>
      </div>
    </footer>
  );
}

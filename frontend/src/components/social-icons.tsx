import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M14 9h3V6h-3c-1.657 0-3 1.343-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9c0-.552.448-1 1-1z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="10" x2="7" y2="16" />
      <circle cx="7" cy="7" r="0.75" fill="currentColor" stroke="none" />
      <path d="M11 16v-3.5c0-1.5 1-2.5 2.25-2.5S15 11 15 12.5V16" />
      <line x1="11" y1="10" x2="11" y2="16" />
    </svg>
  );
}

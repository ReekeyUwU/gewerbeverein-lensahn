import Link from "next/link";
import type { Member } from "@/lib/server-api";

export function LogoMarquee({ members }: { members: Member[] }) {
  const withLogos = members.filter((m) => m.logoUrl);
  if (withLogos.length === 0) return null;

  const track = [...withLogos, ...withLogos];

  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
        {track.map((member, i) => (
          <Link
            key={`${member.id}-${i}`}
            href={`/mitglieder/${member.slug}`}
            className="flex h-20 w-40 shrink-0 items-center justify-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={member.logoUrl ?? ""} alt={member.companyName} className="max-h-full max-w-full object-contain" />
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPosts } from "@/lib/server-api";
import { pressItems } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Neuigkeiten",
  description: "Aktuelle Beiträge und Presseberichte rund um den Gewerbeverein Lensahn e.V.",
};

export default async function NewsPage() {
  const { posts } = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Neuigkeiten</h1>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Beiträge</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {posts.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Beiträge veröffentlicht.</p>}
          {posts.map((post) => (
            <Link key={post.id} href={`/neuigkeiten/${post.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  {post.category && <Badge variant="secondary" className="w-fit">{post.category}</Badge>}
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  {post.excerpt && <p className="text-sm text-muted-foreground">{post.excerpt}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Presse</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {pressItems.map((item) => (
            <Card key={`${item.outlet}-${item.date}`} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-28 w-20 shrink-0 rounded-md object-cover object-top shadow-sm"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {item.outlet} · {new Date(item.date).toLocaleDateString("de-DE", { dateStyle: "medium" })}
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

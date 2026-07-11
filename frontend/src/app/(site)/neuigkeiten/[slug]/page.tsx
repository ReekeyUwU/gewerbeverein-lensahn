import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/server-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post?.seoTitle ?? post?.title ?? "Beitrag",
    description: post?.excerpt ?? undefined,
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      {post.publishedAt && (
        <p className="text-sm text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString("de-DE", { dateStyle: "long" })}
        </p>
      )}
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

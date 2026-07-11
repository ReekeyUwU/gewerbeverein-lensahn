import type { Metadata } from "next";
import { getGalleryAlbums } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Bilder und Videos von Veranstaltungen des Gewerbeverein Lensahn e.V.",
};

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Galerie</h1>
      <p className="mt-4 text-muted-foreground">Impressionen von Sommerfesten, Stammtischen und Aktionen.</p>

      {albums.length === 0 && (
        <p className="mt-12 text-sm text-muted-foreground">
          Noch keine Alben veröffentlicht – schaut bald wieder vorbei.
        </p>
      )}

      <div className="mt-12 space-y-16">
        {albums.map((album) => (
          <section key={album.id}>
            <h2 className="text-xl font-semibold">{album.title}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {album.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={album.title}
                  loading="lazy"
                  className="aspect-square w-full rounded-xl object-cover transition-transform hover:scale-[1.02]"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Download as DownloadIcon } from "lucide-react";
import { getDownloads } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Satzung, Mitgliedsantrag und weitere Formulare zum Download.",
};

export default async function DownloadsPage() {
  const downloads = await getDownloads();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Downloads</h1>
      <p className="mt-4 text-muted-foreground">Satzung, Mitgliedsantrag, Flyer und weitere Dokumente.</p>

      <div className="mt-12 space-y-3">
        {downloads.length === 0 && (
          <p className="text-sm text-muted-foreground">Aktuell sind keine Dateien hinterlegt.</p>
        )}
        {downloads.map((file) => (
          <a
            key={file.id}
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-accent"
          >
            <DownloadIcon className="size-5 text-primary" />
            <div>
              <p className="font-medium">{file.title}</p>
              {file.category && <p className="text-sm text-muted-foreground">{file.category}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

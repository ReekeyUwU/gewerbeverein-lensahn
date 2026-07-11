"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function RichTextEditor({
  content,
  onChange,
  accessToken,
}: {
  content: string;
  onChange: (html: string) => void;
  accessToken: string | null;
}) {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] rounded-b-lg border border-t-0 border-input bg-background px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  async function handleImageUpload(file: File | null) {
    if (!file || !editor) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
      });
      if (!res.ok) throw new Error("Upload fehlgeschlagen");
      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // silent: toolbar has no toast context, upstream form validation catches failures
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!editor) return null;

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Fett",
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Kursiv",
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Heading2,
      label: "Überschrift",
      active: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: List,
      label: "Liste",
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Nummerierte Liste",
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: LinkIcon,
      label: "Link",
      active: editor.isActive("link"),
      onClick: () => {
        const url = window.prompt("Link-URL");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-input bg-secondary/40 p-1">
        {toolbarButtons.map((btn) => (
          <Button
            key={btn.label}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={btn.label}
            className={cn(btn.active && "bg-accent")}
            onClick={btn.onClick}
          >
            <btn.icon className="size-4" />
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Bild einfügen"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="size-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)}
        />
        <span className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Rückgängig"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Wiederholen"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="size-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

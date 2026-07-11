import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Gewerbeverein Lensahn Admin",
  },
  robots: { index: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AdminAuthProvider>{children}</AdminAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

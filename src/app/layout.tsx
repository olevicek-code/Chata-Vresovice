import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chata Vřesovice | Odpočinek uprostřed přírody",
  description:
    "Chata Vřesovice – rodinná chata pro nezapomenutelné chvíle s rodinou a přáteli. Prohlédněte si okolí, fotogalerii a rezervujte si svůj termín.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ScrollProgress />
        {/* faint grain texture over the whole page for a more tactile,
            natural feel instead of flat digital color fields */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70] opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import CustomCursor from "@/components/CustomCursor";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_TITLE = "Chata Vřesovice | Odpočinek uprostřed přírody";
const SITE_DESCRIPTION =
  "Chata Vřesovice – rodinná chata pro nezapomenutelné chvíle s rodinou a přáteli. Prohlédněte si okolí, fotogalerii a rezervujte si svůj termín.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chatavresovice.cz"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "https://www.chatavresovice.cz",
    siteName: "Chata Vřesovice",
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`h-full antialiased ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Sets the initial light/dark theme before hydration (from the
            saved choice, or a quick hour-of-day guess) so there's no flash
            of the wrong theme. ThemeToggle takes over afterwards and
            refines the "auto" guess with the real sunrise/sunset. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('chata-theme');var t=s;if(t!=='light'&&t!=='dark'){var h=new Date().getHours();t=(h>=7&&h<20)?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <CustomCursor />
        <ConsoleEasterEgg />
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
        <Analytics />
      </body>
    </html>
  );
}

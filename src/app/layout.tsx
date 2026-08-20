import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

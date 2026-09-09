import type { Metadata } from "next";
import AdminApp from "@/components/AdminApp";

export const metadata: Metadata = {
  title: "Administrace | Chata Vřesovice",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="min-h-[70vh] bg-forest/5 py-20">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-wood">
          Administrace
        </p>
        <h1 className="section-heading mt-2 font-display text-3xl font-medium text-forest-dark sm:text-4xl">
          Správa rezervací
        </h1>
        <div className="mt-8">
          <AdminApp />
        </div>
      </div>
    </section>
  );
}

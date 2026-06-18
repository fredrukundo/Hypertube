import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthGuard from "@/components/layout/AuthGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Hypertube",
    template: "%s | Hypertube",
  },
};


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
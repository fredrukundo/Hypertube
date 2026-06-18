"use client"

import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();


  return (
    <footer className="bg-card border-t-2 border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand  */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎬</span>
              <span className="text-lg font-black text-foreground">Hypertube</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t.footer.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
              {t.footer.navigation}
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/library", label: t.nav.library },
                { href: "/settings", label: t.nav.settings },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-[#2872A1] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
              {t.footer.legal}
            </h4>
            <ul className="space-y-2">
              {[
                { href: "https://archive.org", label: "Archive.org" },
                { href: "http://www.legittorrents.info", label: "LegitTorrents" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-[#2872A1] transition-colors"
                  >
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {t.footer.legalNote}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Hypertube. {t.footer.rights}.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#2872A1] rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {t.footer.streamingSince} {currentYear}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
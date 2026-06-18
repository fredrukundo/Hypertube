"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Film,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import Avatar from "@/components/common/Avatar";
import { useCurrentUser } from "@/hooks/useUser";
import { useLanguage } from "@/providers/LanguageProvider";

export default function Header() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { data: user } = useCurrentUser();
  const { t } = useLanguage();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  // NAV_LINKS must be inside component
  const NAV_LINKS = [
    { href: "/library", label: t.nav.library, icon: Film },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b-2 border-border backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/library"
            className="flex items-center gap-2.5 group"
          >
            <Image
                src="/logo.png"
                alt="Hypertube"
                width={60}
                height={60}
                className="object-contain h-10 w-auto"
                priority
            
            />
            <span className="text-xl font-black text-foreground group-hover:text-[#2872A1] transition-colors">
              Hypertube
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#2872A1] text-white"
                      : "text-foreground hover:bg-secondary hover:text-[#2872A1]"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border-2 border-border hover:border-[#2872A1] transition-all duration-200 bg-card"
              >
                <Avatar
                  src={user?.profile_picture}
                  alt={user?.username ?? "User"}
                  initials={`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`}
                  size="sm"
                />

                <span className="text-sm font-semibold text-foreground max-w-[100px] truncate">
                  {user?.username ?? "User"}
                </span>

                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 bg-card border-2 border-border rounded-xl shadow-xl overflow-hidden w-52">

                    <div className="px-4 py-3 border-b border-border bg-secondary/30">
                      <p className="text-sm font-bold text-foreground truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user?.username}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile/me"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <User size={16} className="text-[#2872A1]" />
                        {t.nav.profile}
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <Settings size={16} className="text-[#2872A1]" />
                        {t.nav.settings}
                      </Link>
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut size={16} />
                        {t.nav.logout}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-border text-foreground hover:border-[#2872A1] hover:text-[#2872A1] transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">

            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#2872A1] text-white"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}

            <Link
              href="/profile/me"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-all"
            >
              <User size={18} className="text-[#2872A1]" />
              {t.nav.profile}
            </Link>

            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-all"
            >
              <Settings size={18} className="text-[#2872A1]" />
              {t.nav.settings}
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut size={18} />
              {t.nav.logout}
            </button>

            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
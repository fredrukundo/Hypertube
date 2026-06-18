"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Film, Settings } from "lucide-react";
import { usePublicUser } from "@/hooks/useUser";
import { useAuthStore } from "@/store/auth.store";
import Avatar from "@/components/common/Avatar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useLanguage } from "@/providers/LanguageProvider";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";



interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  
  const { lang, setLang } = useLanguage();
  const { id } = use(params);
  const { user: currentUser } = useAuthStore();
  
  const { t } = useLanguage();

  const currentLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === lang
  );

  // Handle /profile/me safely
  const isMeRoute = id === "me";

  // If accessing /profile/me but user not loaded yet → wait
  if (isMeRoute && !currentUser?.id) {
    return<LoadingSpinner fullScreen text={t.profile.loadingProfile} />;
  }

  // Resolve actual ID
  const resolvedId = isMeRoute
    ? String(currentUser?.id)
    : id;

  // Fetch profile safely
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = usePublicUser(resolvedId);

  // Loading state
  if (isLoading) {
    return<LoadingSpinner fullScreen text={t.profile.loadingProfile} />;
  }

  // Error state
  if (isError) {
    return (
      <ErrorMessage message={t.profile.profileLoadError} />
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
       {t.profile.userNotFound}
      </div>
    );
  }

  // Determine ownership properly
  const isOwnProfile = currentUser?.id === profile.id;

  const firstName = profile.first_name || "";
  const lastName = profile.last_name || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Back button */}
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-[#2872A1] transition-colors"
      >
        <ArrowLeft size={16} />
        {t.profile.back}
      </Link>

      {/* Profile Card */}
      <div className="bg-card border-2 border-border rounded-3xl overflow-hidden">

        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#2872A1] to-[#4A90B8] relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="ring-4 ring-card rounded-full z-40">
              <Avatar
                src={profile.profile_picture}
                alt={profile.username}
                initials={initials}
                size="lg"
                className="!w-24 !h-24 !text-2xl !border-4"
              />
            </div>

            {isOwnProfile && (
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#2872A1] text-[#2872A1] text-sm font-bold hover:bg-[#2872A1] hover:text-white transition-all duration-200"
              >
                <Settings size={15} />
                {t.profile.editProfile}
              </Link>
            )}
          </div>

          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-black text-foreground">
              {firstName} {lastName}
            </h1>
            <p className="text-muted-foreground font-medium">
              @{profile.username}
            </p>

            {isOwnProfile && profile.email && (
              <p className="text-sm text-muted-foreground">
                {profile.email}
              </p>
            )}

            {isOwnProfile && profile.preferred_language && (
              <p className="text-xs text-muted-foreground mt-2">
                {t.profile.languageLabel}:{" "}
                {currentLang?.code === "en"
                  ? "English"
                  : "Français"
                  }
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#CBDDE9] dark:bg-[#2872A1]/20 rounded-xl flex items-center justify-center">
                <Film size={18} className="text-[#2872A1]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t.nav.profile}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {isOwnProfile ? t.profile.yourAccount : t.profile.publicProfile}
                </p>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#CBDDE9] dark:bg-[#2872A1]/20 rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-[#2872A1]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t.profile.memberSince}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="bg-[#CBDDE9]/30 dark:bg-[#2872A1]/10 border-2 border-[#2872A1]/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">👋</span>
          <div>
            <p className="text-sm font-bold text-foreground">
              {t.profile.yourPublicProfileTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.profile.yourPublicProfileDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
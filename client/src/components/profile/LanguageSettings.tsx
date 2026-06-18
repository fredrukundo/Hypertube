"use client";

import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useUser";
import { useToastStore } from "@/store/toast.store";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import type { User } from "@/types/user.types";
import { useLanguage } from "@/providers/LanguageProvider";

interface LanguageSettingsProps {
  user: User;
}

export default function LanguageSettings({ user }: LanguageSettingsProps) {
  const updateProfile = useUpdateProfile();
  const { success, error } = useToastStore();

  const { setLang } = useLanguage()

  const [selectedLang, setSelectedLang] = useState(
    user.preferred_language || "en"
  );
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user.preferred_language) {
      setSelectedLang(user.preferred_language);
    }
  }, [user]);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === user.preferred_language) return;

    try {
      setUpdating(true);
      setSelectedLang(langCode);

      await updateProfile.mutateAsync({
        preferred_language: langCode,
      });

      success("Language updated successfully");

      localStorage.setItem("app_language", langCode);

      setLang(langCode);

    } catch (err: any) {
      error("Failed to update language");
      setSelectedLang(user.preferred_language || "en");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Globe size={20} className="text-[#2872A1]" />
        <h2 className="text-lg font-black text-foreground">
          Language Preference
        </h2>
      </div>

      <div className="space-y-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={updating}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              selectedLang === lang.code
                ? "border-[#2872A1] bg-[#2872A1]/10"
                : "border-border hover:border-[#2872A1]/50"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="font-semibold text-sm text-foreground">
              {lang.label}
            </span>
            {selectedLang === lang.code && (
              <Check size={18} className="text-[#2872A1]" />
            )}
          </button>
        ))}
      </div>

      {updating && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-[#2872A1] border-t-transparent rounded-full animate-spin" />
          Updating language...
        </p>
      )}
    </div>
  );
}
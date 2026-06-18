"use client";

import { Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useCurrentUser } from "@/hooks/useUser";
import { useToastStore } from "@/store/toast.store";
import { useConfirmStore } from "@/store/confirm.store";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";
import EditProfileForm from "@/components/profile/EditProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import LanguageSettings from "@/components/profile/LanguageSettings";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import api from "@/lib/axios";
import { useLanguage } from "@/providers/LanguageProvider";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { success, error } = useToastStore();
  const confirm = useConfirmStore((state) => state.confirm);

  const { isLoading, isError, refetch } = useCurrentUser();

  const { t } = useLanguage();

  if (!user && isLoading) {
    return <LoadingSpinner fullScreen text={t.settings.loading} />;
  }

  if (!user || isError) {
    return (
      <ErrorMessage
        message={ t.settings.loadError }
        onRetry={() => refetch()}
      />
    );
  }

  const handleDeleteAccount = async () => {
    const confirmed = await confirm(t.settings.deleteConfirm);

    if (!confirmed) return;

    try {
      await api.delete("/users/delete");

      success(t.settings.deleteSuccess);

      // Clear auth state
      logout();

      // logout() already redirects to /login
    } catch (err: any) {
      error(err?.response?.data?.error?.code || t.settings.deleteError);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#CBDDE9] dark:bg-[#2872A1]/20 rounded-xl flex items-center justify-center">
          <Settings size={20} className="text-[#2872A1]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            {t.settings.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      <ProfilePictureUpload user={user} />
      <EditProfileForm user={user} />
      <ChangePasswordForm />
      <LanguageSettings user={user} />

      {/* Danger Zone */}
      <div className="bg-card border-2 border-destructive/30 rounded-2xl p-6">
        <h2 className="text-lg font-black text-destructive mb-2">
          {t.settings.dangerZone}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t.settings.dangerDescription}
        </p>

        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border-2 border-destructive/30 hover:border-destructive font-bold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
        >
          {t.settings.deleteAccount}
        </button>
      </div>

    </div>
  );
}
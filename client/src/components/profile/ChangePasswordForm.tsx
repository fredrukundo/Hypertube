"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, TriangleAlert } from "lucide-react";
import { useToastStore } from "@/store/toast.store";
import api from "@/lib/axios";
import { useLanguage } from "@/providers/LanguageProvider";


export default function ChangePasswordForm() {
  const { t } = useLanguage();

  const passwordSchema = z
    .object({
      currentPassword: z
        .string()
        .min(1, t.profile.passwordValidation.currentRequired),
      newPassword: z
        .string()
        .min(6, t.profile.passwordValidation.newMin),
      confirmPassword: z
        .string()
        .min(1, t.profile.passwordValidation.confirmRequired),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t.profile.passwordValidation.notMatch,
      path: ["confirmPassword"],
    });

  type PasswordFormData = z.infer<typeof passwordSchema>;


  const { success, error } = useToastStore();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await api.post("/security/change-password", {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });

      success(t.profile.changePasswordSuccess);
      reset();
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.code === "INVALID_CREDENTIALS"
          ? t.profile.passwordValidation.invalidCurrent
          : err?.response?.data?.error?.code === "WEAK_PASSWORD"
            ? t.profile.passwordValidation.newMin
            : t.profile.changePasswordError;

      error(message);
    }
  };


  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lock size={20} className="text-[#2872A1]" />
        <h2 className="text-lg font-black text-foreground">
          {t.profile.changePassword}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            {t.profile.currentPassword}
          </label>
          <div className="relative">
            <input
              {...register("currentPassword")}
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              className={`w-full px-4 py-2.5 pr-12 rounded-xl border-2 bg-card text-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${errors.currentPassword
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            {t.profile.newPassword}
          </label>
          <div className="relative">
            <input
              {...register("newPassword")}
              type={showNew ? "text" : "password"}
              placeholder="Enter new password (min 6 chars)"
              className={`w-full px-4 py-2.5 pr-12 rounded-xl border-2 bg-card text-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${errors.newPassword
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            {t.profile.confirmPassword}
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              className={`w-full px-4 py-2.5 pr-12 rounded-xl border-2 bg-card text-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${errors.confirmPassword
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Info */}
        <div className="bg-[#CBDDE9]/30 dark:bg-[#2872A1]/10 border-2 border-[#2872A1]/20 rounded-xl p-3 text-xs text-muted-foreground">
           Password must be at least 6 characters long
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.profile.changingPassword}
            </>
          ) : (
            <>
              <Lock size={16} />
              {t.profile.changePassword}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
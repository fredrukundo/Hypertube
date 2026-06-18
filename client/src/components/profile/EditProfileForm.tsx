"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useUser";
import { useToastStore } from "@/store/toast.store";
import { User } from "@/types/user.types";
import { useLanguage } from "@/providers/LanguageProvider";
import { TriangleAlert } from "lucide-react";


interface EditProfileFormProps {
  user: User;
}



export default function EditProfileForm({
  user,
}: EditProfileFormProps) {

  const { t } = useLanguage();

  const editProfileSchema = z.object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, t.profile.validation.usernameMin)
      .regex(
        /^([a-z.]{3,})$/,
        t.profile.validation.usernameFormat
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(t.profile.validation.invalidEmail),

    first_name: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z]+$/,
        t.profile.validation.firstNameLetters
      ),

    last_name: z
      .string()
      .trim()
      .regex(
        /^[a-zA-Z]+$/,
        t.profile.validation.lastNameLetters
      ),
  });

  type EditProfileData = z.infer<typeof editProfileSchema>;

  const updateProfile = useUpdateProfile();
  const { success, error, info } = useToastStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
  });

  useEffect(() => {
    reset({
      username: user.username ?? "",
      email: user.email ?? "",
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
    });
  }, [user, reset]);

  const onSubmit = async (data: EditProfileData) => {
    try {
      const updates: Partial<EditProfileData> = {};

      if (data.username !== user.username) updates.username = data.username;
      if (data.email !== user.email) updates.email = data.email;
      if (data.first_name !== user.first_name)
        updates.first_name = data.first_name;
      if (data.last_name !== user.last_name)
        updates.last_name = data.last_name;

      if (Object.keys(updates).length === 0) {
        info(t.profile.noChanges);
        return;
      }

      await updateProfile.mutateAsync(updates);

      success(t.profile.updateSuccess);
    } catch (err: any) {
      error(err.message || t.profile.updateError);
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-6">
      <h2 className="text-lg font-black text-foreground mb-4">
        {t.profile.personalInformation}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            {t.profile.username}
          </label>
          <input
            {...register("username")}
            type="text"
            className={`w-full px-4 py-2.5 rounded-xl border-2 bg-card text-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${errors.username
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border"
              }`}
          />
          {errors.username && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            {t.profile.email}
          </label>
          <input
            {...register("email")}
            type="email"
            className={`w-full px-4 py-2.5 rounded-xl border-2 bg-card text-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${errors.email
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border"
              }`}
          />
          {errors.email && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.email.message}
            </p>
          )}
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground block">
              {t.profile.firstName}
            </label>
            <input
              {...register("first_name")}
              type="text"
              className={`w-full px-4 py-2.5 rounded-xl border-2 bg-card text-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${errors.first_name
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
                }`}
            />
            {errors.first_name && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <span><TriangleAlert size={18}/></span> {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground block">
              {t.profile.lastName}
            </label>
            <input
              {...register("last_name")}
              type="text"
              className={`w-full px-4 py-2.5 rounded-xl border-2 bg-card text-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${errors.last_name
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
                }`}
            />
            {errors.last_name && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <span><TriangleAlert size={18}/></span> {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="flex items-center gap-2 bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.common.loading}
            </>
          ) : (
            <>
              <Save size={16} />
              {t.profile.save}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
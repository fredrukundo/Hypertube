"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle, ArrowLeft, TriangleAlert } from "lucide-react";
import { resetPassword } from "@/services/auth.service";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-destructive text-2xl"><TriangleAlert size={18}/></span>
        </div>
        <h2 className="text-2xl font-black text-foreground mb-3">Invalid link</h2>
        <p className="text-muted-foreground mb-6">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-[#2872A1] hover:text-[#1A4A6B] font-semibold transition-colors"
        >
          Request a new one
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#CBDDE9] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-[#2872A1]" size={32} />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-3">
          Password updated!
        </h2>
        <p className="text-muted-foreground mb-8">
          Your password has been successfully reset.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold px-8 py-3 rounded-xl transition-all duration-200"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      setServerError(null);
      await resetPassword(token, data.password);
      setSuccess(true);
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message ||
          "Failed to reset password. The link may have expired."
      );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground">New password</h2>
        <p className="text-muted-foreground mt-2">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            New Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 chars, uppercase, number"
              autoComplete="new-password"
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
                errors.password
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
                errors.confirmPassword
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
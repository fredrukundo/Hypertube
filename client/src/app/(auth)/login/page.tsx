"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, TriangleAlert } from "lucide-react";
import OAuthButtons from "@/components/auth/OAuthButtons";
import Divider from "@/components/common/Divider";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useSearchParams } from "next/navigation";

// Validation schema
const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, "Username or email is required")
    .min(3, "Must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

   const searchParams = useSearchParams();

   // Check for OAuth errors from URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setServerError(decodeURIComponent(error));
      // Clean up URL
      router.replace("/login");
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      
      // Call login with username/email and password
       await login(data.usernameOrEmail, data.password);
      
      // Redirect to library
      router.push("/library");
    } catch (error: any) {
      // Display the error message from the service
      setServerError(error.message || "An unexpected error occurred");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground">Welcome back</h2>
        <p className="text-muted-foreground mt-2">
          Sign in to continue watching
        </p>
      </div>

      {/* OAuth Buttons */}
      <OAuthButtons mode="login" />

      {/* Divider */}
      <Divider text="or sign in with email/username" />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* Server error */}
        {serverError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="text-base"><TriangleAlert size={18}/></span>
            <span>{serverError}</span>
          </div>
        )}

        {/* Username or Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            Username or Email
          </label>
          <input
            {...register("usernameOrEmail")}
            type="text"
            placeholder="Enter your username or email"
            autoComplete="username"
            className={`w-full px-4 py-3 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
              errors.usernameOrEmail
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border"
            }`}
          />
          {errors.usernameOrEmail && (
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.usernameOrEmail.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#2872A1] hover:text-[#1A4A6B] font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
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
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#2872A1] hover:bg-[#1A4A6B] text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#2872A1] hover:text-[#1A4A6B] font-semibold transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
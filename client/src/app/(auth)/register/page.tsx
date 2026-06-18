"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, UserPlus, TriangleAlert } from "lucide-react";
import OAuthButtons from "@/components/auth/OAuthButtons";
import Divider from "@/components/common/Divider";
import { register as registerUser } from "@/services/auth.service";

// Validation schema matching backend rules
const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-z]+(\.[a-z]+)*$/,
      "Username must be lowercase, can contain dots (not at start/end or consecutive)"
    )
    .refine((val) => !val.includes(".."), "Username cannot have consecutive dots"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  repassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
}).refine((data) => data.password === data.repassword, {
  message: "Passwords do not match",
  path: ["repassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      setSuccessMessage(null);
      
      await registerUser(data);
      
      // Show success message
      setSuccessMessage("Account created successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (error: any) {
      setServerError(error.message || "Registration failed");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground">Create Account</h2>
        <p className="text-muted-foreground mt-2">
          Join Hypertube to start watching
        </p>
      </div>

      {/* OAuth Buttons */}
      <OAuthButtons mode="register" />

      {/* Divider */}
      <Divider text="or register with email" />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="text-base">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <span>{serverError}</span>
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            placeholder="username (lowercase only)"
            autoComplete="username"
            className={`w-full px-4 py-3 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
              errors.username
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border"
            }`}
          />
          {errors.username && (
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            className={`w-full px-4 py-3 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
              errors.email
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border"
            }`}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.email.message}
            </p>
          )}
        </div>

        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground block">
              First Name
            </label>
            <input
              {...register("first_name")}
              type="text"
              placeholder="first name"
              autoComplete="given-name"
              className={`w-full px-4 py-3 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
                errors.first_name
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
              }`}
            />
            {errors.first_name && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                <span><TriangleAlert size={18}/></span> {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground block">
              Last Name
            </label>
            <input
              {...register("last_name")}
              type="text"
              placeholder="last name"
              autoComplete="family-name"
              className={`w-full px-4 py-3 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
                errors.last_name
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
              }`}
            />
            {errors.last_name && (
              <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                <span><TriangleAlert size={18}/></span> {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
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
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
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
              {...register("repassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
                errors.repassword
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.repassword && (
            <p className="text-destructive text-xs mt-1 flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.repassword.message}
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
              <UserPlus size={18} />
              Create Account
            </>
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#2872A1] hover:text-[#1A4A6B] font-semibold transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
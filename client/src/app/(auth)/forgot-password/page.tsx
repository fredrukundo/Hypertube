"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle, TriangleAlert } from "lucide-react";
import { forgotPassword } from "@/services/auth.service";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError(null);
      await forgotPassword(data.email);
      setSubmitted(true);
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#CBDDE9] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-[#2872A1]" size={32} />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-3">Check your email</h2>
        <p className="text-muted-foreground mb-2">
          We sent a reset link to:
        </p>
        <p className="text-[#2872A1] font-semibold mb-8">
          {getValues("email")}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => setSubmitted(false)}
            className="text-[#2872A1] hover:text-[#1A4A6B] font-semibold transition-colors"
          >
            try again
          </button>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    );
  }

  // Form state
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground">Reset password</h2>
        <p className="text-muted-foreground mt-2">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-xl">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground block">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-card text-foreground placeholder:text-muted-foreground text-sm transition-all duration-200 outline-none focus:border-[#2872A1] focus:ring-2 focus:ring-[#2872A1]/20 ${
                errors.email
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <span><TriangleAlert size={18}/></span> {errors.email.message}
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
            "Send Reset Link"
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
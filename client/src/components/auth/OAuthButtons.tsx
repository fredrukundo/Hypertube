"use client";

import { useState } from "react";
import Image from "next/image";
import gihub from "../../../public/github.png"
import discord from "../../../public/disco.webp"

interface OAuthButtonsProps {
  mode: "login" | "register";
}

export default function OAuthButtons({ mode }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuth = (provider: "42" | "github" | "discord") => {
    setLoadingProvider(provider);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Simple redirect - backend will handle everything
    window.location.href = `${baseUrl}/auth/${provider}`;
  };

  return (
    <div className="space-y-3">
      {/* 42 OAuth */}
      <button
        onClick={() => handleOAuth("42")}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-card text-card-foreground font-semibold text-sm hover:bg-[#CBDDE9] hover:border-[#2872A1] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingProvider === "42" ? (
          <span className="w-5 h-5 border-2 border-[#2872A1] border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="w-6 h-6 bg-[#2872A1] text-white rounded flex items-center justify-center text-xs font-black">
            42
          </span>
        )}
        {mode === "login" ? "Login" : "Sign up"} with 42
      </button>

      {/* GitHub OAuth */}
      <button
        onClick={() => handleOAuth("github")}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-card text-card-foreground font-semibold text-sm hover:bg-[#CBDDE9] hover:border-[#2872A1] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingProvider === "github" ? (
          <span className="w-5 h-5 border-2 border-[#2872A1] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Image
            src= {gihub}
            width={40}
            height={40}
            className="text-foreground"
            alt="Gihub icon"
          />
        )}
        {mode === "login" ? "Login" : "Sign up"} with GitHub
      </button>

      {/* Discord OAuth */}
      <button
        onClick={() => handleOAuth("discord")}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-border bg-card text-card-foreground font-semibold text-sm hover:bg-[#CBDDE9] hover:border-[#2872A1] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingProvider === "github" ? (
          <span className="w-5 h-5 border-2 border-[#2872A1] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Image
            src= {discord}
            width={40}
            height={40}
            className="text-foreground"
            alt="Gihub icon"
          />
        )}
        {mode === "login" ? "Login" : "Sign up"} with Discord
      </button>
    </div>
  );
}
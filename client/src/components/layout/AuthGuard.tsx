"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useUser";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <AuthGuardInner>{children}</AuthGuardInner>;
}

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth({ requireAuth: true });

  // Sync user from backend/mock on every protected page load
  useCurrentUser();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading Hypertube..." />;
  }

  return <>{children}</>;
}
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <GuestGuardInner>{children}</GuestGuardInner>;
}

function GuestGuardInner({ children }: { children: React.ReactNode }) {
  useAuth({ requireGuest: true });
  return <>{children}</>;
}